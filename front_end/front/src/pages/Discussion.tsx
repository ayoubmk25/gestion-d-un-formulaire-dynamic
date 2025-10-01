import React, { useEffect, useState, useRef } from 'react';
import { useApi } from '@/hooks/useApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Loader2, 
  MessageSquare, 
  Plus, 
  Send, 
  Check, 
  Search,
  UserCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface DiscussionMessage {
  id: number;
  sender_id: number;
  recipient_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    name: string;
    role?: string;
  };
  recipient: {
    id: number;
    name: string;
    role?: string;
  } | null;
}

interface Discussion {
  id: number;
  sender_id: number;
  recipient_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  read_at?: string | null;
  sender: {
    id: number;
    name: string;
    role?: string;
  };
  recipient: {
    id: number;
    name: string;
    role?: string;
  } | null;
  messages?: DiscussionMessage[];
  last_message?: {
    content: string;
    created_at: string;
  };
}

const Discussion: React.FC = () => {
  const { 
    getUserDiscussions,
    getDiscussionMessages,
    getDiscussionById,
    sendMessage,
    markDiscussionAsRead,
    user,
    listCollaborators, // Import listCollaborators from useApi
    getCollaboratorMessageRecipients, // Import the new function
  } = useApi();
  
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<number | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [initialMessage, setInitialMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter discussions based on search query
  const filteredDiscussions = discussions.filter(disc => 
    disc.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (disc.recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    disc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load users for new discussion creation
  useEffect(() => {
    const loadUsers = async () => {
      if (user?.role === 'administrator') {
        try {
          // Administrators can message collaborators
          const response = await listCollaborators();
          setAvailableUsers(response.data);
        } catch (error) {
          console.error('Error loading collaborators:', error);
          toast({
            title: "Error loading users",
            description: "Could not load the list of users for discussion.",
            variant: "destructive",
          });
        }
      } else if (user?.role === 'technician' || user?.role === 'validator') {
        try {
          // Collaborators (technicians/validators) can message administrators and other collaborators/validators
          const response = await getCollaboratorMessageRecipients();
          setAvailableUsers(response.data);
        } catch (error) {
          console.error('Error loading message recipients for collaborator:', error);
          toast({
            title: "Error loading users",
            description: "Could not load the list of users for discussion.",
            variant: "destructive",
          });
        }
      }
    };

    // Load users when the new discussion dialog is opened and the user role is administrator, technician, or validator
    if (newDiscussionOpen && (user?.role === 'administrator' || user?.role === 'technician' || user?.role === 'validator')) {
      loadUsers();
    }
  }, [newDiscussionOpen, user?.role, listCollaborators, getCollaboratorMessageRecipients]); // Add getCollaboratorMessageRecipients to dependencies

  // Load all discussions initially
  useEffect(() => {
    const loadDiscussions = async () => {
      setIsLoading(true);
      try {
        const response = await getUserDiscussions();
        setDiscussions(response.data);
      } catch (error) {
        console.error('Error loading discussions:', error);
        toast({
          title: "Error loading discussions",
          description: "There was a problem loading the discussions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscussions();
  }, [getUserDiscussions]);

  // Load messages for the selected discussion
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedDiscussionId) {
        setIsMessagesLoading(true);
        try {
          const messagesResponse = await getDiscussionMessages(String(selectedDiscussionId));
          setMessages(messagesResponse.data.messages || []);
          
          // Mark as read
          await markDiscussionAsRead(String(selectedDiscussionId));
        } catch (error) {
          console.error('Error loading messages:', error);
          toast({
            title: "Error loading messages",
            description: "There was a problem loading the messages.",
            variant: "destructive",
          });
        } finally {
          setIsMessagesLoading(false);
        }
      } else {
        setMessages([]); // Clear messages when no discussion is selected
      }
    };

    loadMessages();
  }, [selectedDiscussionId, getDiscussionMessages, markDiscussionAsRead]);

  // Set up real-time messaging with Echo/Pusher for the selected discussion
  useEffect(() => {
    if (selectedDiscussionId) {
      const echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
      });

      echo.channel(`discussion.${selectedDiscussionId}`)
        .listen('MessageSent', (e: { discussion: DiscussionMessage }) => {
          setMessages(prevMessages => [...prevMessages, e.discussion]);
          scrollToBottom();
        });

      return () => {
        echo.leaveChannel(`discussion.${selectedDiscussionId}`);
      };
    }
  }, [selectedDiscussionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get the other participant's name for a given discussion object
  const getOtherParticipantName = (disc: Discussion) => {
    if (!user) return 'Unknown';
    return disc.sender_id === Number(user.id)
      ? disc.recipient?.name || 'System' 
      : disc.sender.name;
  };

  // Handle sending a message in the selected discussion
  const handleSendMessage = async () => {
    console.log('handleSendMessage called'); // Added logging
    if (!newMessage.trim() || !selectedDiscussionId) return;

    // Find the selected discussion object to get recipient_id
    const currentDiscussion = discussions.find(d => d.id === selectedDiscussionId);
    if (!currentDiscussion) return;

    try {
      await sendMessage({
        discussion_id: selectedDiscussionId,
        recipient_id: currentDiscussion.sender_id === Number(user?.id)
          ? currentDiscussion.recipient?.id 
          : currentDiscussion.sender.id,
        content: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message.",
        variant: "destructive",
      });
    }
  };

  // Create a new discussion with initial message
  const handleCreateDiscussion = async () => {
    console.log('handleCreateDiscussion called'); // Added logging
    if (!initialMessage.trim() || !selectedUserId) {
      toast({
        title: "Missing information",
        description: "Please select a recipient and enter a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await sendMessage({
        recipient_id: parseInt(selectedUserId),
        content: initialMessage
      });

      setNewDiscussionOpen(false);
      setInitialMessage('');
      setSelectedUserId('');
      

     window.location.reload();

      toast({
        title: "Discussion created",
        description: "Your new conversation has been started.",
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error creating discussion",
        description: "There was a problem creating the discussion.",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Find the currently selected discussion object
  const selectedDiscussion = discussions.find(disc => disc.id === selectedDiscussionId);

  // Loading state for initial discussions list
  if (isLoading && !selectedDiscussionId) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading discussions...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Discussions list view (no specific discussion selected)
  if (!selectedDiscussionId) {
    return (
      <Layout>
        <div className="container py-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Discussions</h1>

            <Dialog open={newDiscussionOpen} onOpenChange={setNewDiscussionOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a New Discussion</DialogTitle>
                  <DialogDescription>
                    Select a recipient and type your initial message to start a new conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="recipient" className="text-sm font-medium">Select Recipient</label>
                    <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map(user => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Initial Message</label>
                    <Textarea
                      placeholder="Type your message here..."
                      className="min-h-[100px]"
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateDiscussion} className="w-full">
                    Start Discussion
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredDiscussions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No discussions found</h3>
                {searchQuery ? (
                  <p className="text-muted-foreground text-center">No discussions match your search criteria.</p>
                ) : (
                  <p className="text-muted-foreground text-center mb-4">Start a new discussion to chat with collaborators or administrators.</p>
                )}
                {!searchQuery && (
                  <Button onClick={() => setNewDiscussionOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDiscussions.map((disc) => {
                const otherParticipant = getOtherParticipantName(disc);
                const isUnread = !disc.read_at;
                
                return (
                  <Card 
                    key={disc.id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${isUnread ? 'border-primary/50' : ''}`}
                    onClick={() => setSelectedDiscussionId(disc.id)} // Update state instead of navigating
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{otherParticipant.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-base font-semibold truncate">
                              {disc.sender_id === Number(user?.id) ? 'Moi' : otherParticipant}
                            </h3>
                            {isUnread && (
                              <Badge variant="default" className="ml-2">Unread</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {disc.last_message?.content || disc.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(disc.last_message?.created_at || disc.created_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Discussion detail view
  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setSelectedDiscussionId(null)
          } className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center">
              <span className="mr-2">Discussion with {getOtherParticipantName(selectedDiscussion)}</span>
              {selectedDiscussion.recipient?.role && (
                <Badge variant="outline" className="ml-2">{selectedDiscussion.recipient.role}</Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              Started on {formatDate(selectedDiscussion.created_at)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Your conversation with {getOtherParticipantName(selectedDiscussion)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div 
                  className="space-y-4 overflow-y-auto flex-grow max-h-[500px] min-h-[400px] p-2" 
                  ref={messagesContainerRef}
                >
                  {/* Initial message */}
                  <div className={`flex ${selectedDiscussion.sender_id === Number(user?.id) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-[70%] ${selectedDiscussion.sender_id === Number(user?.id) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <div className="flex items-center text-xs opacity-75 mb-1">
                        <UserCircle className="h-3 w-3 mr-1" />
                        <span>{selectedDiscussion.sender_id === Number(user?.id) ? 'Moi' : selectedDiscussion.sender.name}</span>
                      </div>
                      <p>{selectedDiscussion.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">{formatDate(selectedDiscussion.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Subsequent messages */}
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender_id === Number(user?.id) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg max-w-[70%] ${message.sender_id === Number(user?.id) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <div className="flex items-center text-xs opacity-75 mb-1">
                          <UserCircle className="h-3 w-3 mr-1" />
                          <span>{message.sender_id === Number(user?.id) ? 'MOI' : message.sender.name}</span>
                        </div>
                        <p>{message.content}</p>
                        <span className="text-xs opacity-75 mt-1 block">{formatDate(message.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <Separator className="my-4" />
                
               
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Discussion Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Participants</h3>
                    <div className="mt-2 space-y-2">
                      {/* Sender info */}
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>{selectedDiscussion.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{selectedDiscussion.sender.name}</p>
                          {selectedDiscussion.sender.role && (
                            <p className="text-xs text-muted-foreground">{selectedDiscussion.sender.role}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Recipient info (if exists) */}
                      {selectedDiscussion.recipient && (
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>{selectedDiscussion.recipient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{selectedDiscussion.recipient.name}</p>
                            {selectedDiscussion.recipient.role && (
                              <p className="text-xs text-muted-foreground">{selectedDiscussion.recipient.role}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => markDiscussionAsRead(String(selectedDiscussionId))} 
                    variant="outline"
                    className="w-full"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Discussion;
