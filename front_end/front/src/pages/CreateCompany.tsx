import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, User, Save, Building, Phone, MapPin, FileText, Users } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Comprehensive list of country codes with flag URLs and names
// Note: Country names remain in English as they are data, not UI text
const countryCodes = [
  { code: '+1', country: 'US', name: 'United States', flagUrl: 'https://flagcdn.com/w20/us.png' },
  { code: '+44', country: 'GB', name: 'United Kingdom', flagUrl: 'https://flagcdn.com/w20/gb.png' },
  { code: '+33', country: 'FR', name: 'France', flagUrl: 'https://flagcdn.com/w20/fr.png' },
  { code: '+49', country: 'DE', name: 'Germany', flagUrl: 'https://flagcdn.com/w20/de.png' },
  { code: '+34', country: 'ES', name: 'Spain', flagUrl: 'https://flagcdn.com/w20/es.png' },
  { code: '+39', country: 'IT', name: 'Italy', flagUrl: 'https://flagcdn.com/w20/it.png' },
  { code: '+212', country: 'MA', name: 'Morocco', flagUrl: 'https://flagcdn.com/w20/ma.png' },
  { code: '+213', country: 'DZ', name: 'Algeria', flagUrl: 'https://flagcdn.com/w20/dz.png' },
  { code: '+216', country: 'TN', name: 'Tunisia', flagUrl: 'https://flagcdn.com/w20/tn.png' },
  { code: '+20', country: 'EG', name: 'Egypt', flagUrl: 'https://flagcdn.com/w20/eg.png' },
  { code: '+971', country: 'AE', name: 'United Arab Emirates', flagUrl: 'https://flagcdn.com/w20/ae.png' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia', flagUrl: 'https://flagcdn.com/w20/sa.png' },
  { code: '+86', country: 'CN', name: 'China', flagUrl: 'https://flagcdn.com/w20/cn.png' },
  { code: '+91', country: 'IN', name: 'India', flagUrl: 'https://flagcdn.com/w20/in.png' },
  { code: '+81', country: 'JP', name: 'Japan', flagUrl: 'https://flagcdn.com/w20/jp.png' },
  { code: '+82', country: 'KR', name: 'South Korea', flagUrl: 'https://flagcdn.com/w20/kr.png' },
  { code: '+55', country: 'BR', name: 'Brazil', flagUrl: 'https://flagcdn.com/w20/br.png' },
  { code: '+52', country: 'MX', name: 'Mexico', flagUrl: 'https://flagcdn.com/w20/mx.png' },
  { code: '+7', country: 'RU', name: 'Russia', flagUrl: 'https://flagcdn.com/w20/ru.png' },
  { code: '+61', country: 'AU', name: 'Australia', flagUrl: 'https://flagcdn.com/w20/au.png' },
  { code: '+93', country: 'AF', name: 'Afghanistan', flagUrl: 'https://flagcdn.com/w20/af.png' },
  { code: '+355', country: 'AL', name: 'Albania', flagUrl: 'https://flagcdn.com/w20/al.png' },
  { code: '+54', country: 'AR', name: 'Argentina', flagUrl: 'https://flagcdn.com/w20/ar.png' },
  { code: '+43', country: 'AT', name: 'Austria', flagUrl: 'https://flagcdn.com/w20/at.png' },
  { code: '+880', country: 'BD', name: 'Bangladesh', flagUrl: 'https://flagcdn.com/w20/bd.png' },
  { code: '+32', country: 'BE', name: 'Belgium', flagUrl: 'https://flagcdn.com/w20/be.png' },
  { code: '+975', country: 'BT', name: 'Bhutan', flagUrl: 'https://flagcdn.com/w20/bt.png' },
  { code: '+591', country: 'BO', name: 'Bolivia', flagUrl: 'https://flagcdn.com/w20/bo.png' },
  { code: '+387', country: 'BA', name: 'Bosnia and Herzegovina', flagUrl: 'https://flagcdn.com/w20/ba.png' },
  { code: '+267', country: 'BW', name: 'Botswana', flagUrl: 'https://flagcdn.com/w20/bw.png' },
  { code: '+673', country: 'BN', name: 'Brunei', flagUrl: 'https://flagcdn.com/w20/bn.png' },
  { code: '+359', country: 'BG', name: 'Bulgaria', flagUrl: 'https://flagcdn.com/w20/bg.png' },
  { code: '+226', country: 'BF', name: 'Burkina Faso', flagUrl: 'https://flagcdn.com/w20/bf.png' },
  { code: '+257', country: 'BI', name: 'Burundi', flagUrl: 'https://flagcdn.com/w20/bi.png' },
  { code: '+855', country: 'KH', name: 'Cambodia', flagUrl: 'https://flagcdn.com/w20/kh.png' },
  { code: '+237', country: 'CM', name: 'Cameroon', flagUrl: 'https://flagcdn.com/w20/cm.png' },
  { code: '+1', country: 'CA', name: 'Canada', flagUrl: 'https://flagcdn.com/w20/ca.png' },
  { code: '+238', country: 'CV', name: 'Cape Verde', flagUrl: 'https://flagcdn.com/w20/cv.png' },
  { code: '+236', country: 'CF', name: 'Central African Republic', flagUrl: 'https://flagcdn.com/w20/cf.png' },
  { code: '+235', country: 'TD', name: 'Chad', flagUrl: 'https://flagcdn.com/w20/td.png' },
  { code: '+56', country: 'CL', name: 'Chile', flagUrl: 'https://flagcdn.com/w20/cl.png' },
  { code: '+57', country: 'CO', name: 'Colombia', flagUrl: 'https://flagcdn.com/w20/co.png' },
  { code: '+269', country: 'KM', name: 'Comoros', flagUrl: 'https://flagcdn.com/w20/km.png' },
  { code: '+243', country: 'CD', name: 'DR Congo', flagUrl: 'https://flagcdn.com/w20/cd.png' },
  { code: '+242', country: 'CG', name: 'Congo', flagUrl: 'https://flagcdn.com/w20/cg.png' },
  { code: '+506', country: 'CR', name: 'Costa Rica', flagUrl: 'https://flagcdn.com/w20/cr.png' },
  { code: '+385', country: 'HR', name: 'Croatia', flagUrl: 'https://flagcdn.com/w20/hr.png' },
  { code: '+53', country: 'CU', name: 'Cuba', flagUrl: 'https://flagcdn.com/w20/cu.png' },
  { code: '+357', country: 'CY', name: 'Cyprus', flagUrl: 'https://flagcdn.com/w20/cy.png' },
  { code: '+420', country: 'CZ', name: 'Czech Republic', flagUrl: 'https://flagcdn.com/w20/cz.png' },
  { code: '+45', country: 'DK', name: 'Denmark', flagUrl: 'https://flagcdn.com/w20/dk.png' },
  { code: '+253', country: 'DJ', name: 'Djibouti', flagUrl: 'https://flagcdn.com/w20/dj.png' },
  { code: '+670', country: 'TL', name: 'East Timor', flagUrl: 'https://flagcdn.com/w20/tl.png' },
  { code: '+593', country: 'EC', name: 'Ecuador', flagUrl: 'https://flagcdn.com/w20/ec.png' },
  { code: '+503', country: 'SV', name: 'El Salvador', flagUrl: 'https://flagcdn.com/w20/sv.png' },
  { code: '+240', country: 'GQ', name: 'Equatorial Guinea', flagUrl: 'https://flagcdn.com/w20/gq.png' },
  { code: '+291', country: 'ER', name: 'Eritrea', flagUrl: 'https://flagcdn.com/w20/er.png' },
  { code: '+372', country: 'EE', name: 'Estonia', flagUrl: 'https://flagcdn.com/w20/ee.png' },
  { code: '+251', country: 'ET', name: 'Ethiopia', flagUrl: 'https://flagcdn.com/w20/et.png' },
  { code: '+679', country: 'FJ', name: 'Fiji', flagUrl: 'https://flagcdn.com/w20/fj.png' },
  { code: '+358', country: 'FI', name: 'Finland', flagUrl: 'https://flagcdn.com/w20/fi.png' },
  { code: '+241', country: 'GA', name: 'Gabon', flagUrl: 'https://flagcdn.com/w20/ga.png' },
  { code: '+220', country: 'GM', name: 'Gambia', flagUrl: 'https://flagcdn.com/w20/gm.png' },
  { code: '+995', country: 'GE', name: 'Georgia', flagUrl: 'https://flagcdn.com/w20/ge.png' },
  { code: '+233', country: 'GH', name: 'Ghana', flagUrl: 'https://flagcdn.com/w20/gh.png' },
  { code: '+30', country: 'GR', name: 'Greece', flagUrl: 'https://flagcdn.com/w20/gr.png' },
  { code: '+502', country: 'GT', name: 'Guatemala', flagUrl: 'https://flagcdn.com/w20/gt.png' },
  { code: '+224', country: 'GN', name: 'Guinea', flagUrl: 'https://flagcdn.com/w20/gn.png' },
  { code: '+245', country: 'GW', name: 'Guinea-Bissau', flagUrl: 'https://flagcdn.com/w20/gw.png' },
  { code: '+592', country: 'GY', name: 'Guyana', flagUrl: 'https://flagcdn.com/w20/gy.png' },
  { code: '+509', country: 'HT', name: 'Haiti', flagUrl: 'https://flagcdn.com/w20/ht.png' },
  { code: '+504', country: 'HN', name: 'Honduras', flagUrl: 'https://flagcdn.com/w20/hn.png' },
  { code: '+36', country: 'HU', name: 'Hungary', flagUrl: 'https://flagcdn.com/w20/hu.png' },
  { code: '+354', country: 'IS', name: 'Iceland', flagUrl: 'https://flagcdn.com/w20/is.png' },
  { code: '+62', country: 'ID', name: 'Indonesia', flagUrl: 'https://flagcdn.com/w20/id.png' },
  { code: '+98', country: 'IR', name: 'Iran', flagUrl: 'https://flagcdn.com/w20/ir.png' },
  { code: '+964', country: 'IQ', name: 'Iraq', flagUrl: 'https://flagcdn.com/w20/iq.png' },
  { code: '+353', country: 'IE', name: 'Ireland', flagUrl: 'https://flagcdn.com/w20/ie.png' },
  { code: '+972', country: 'IL', name: 'Israel', flagUrl: 'https://flagcdn.com/w20/il.png' },
  { code: '+225', country: 'CI', name: 'Ivory Coast', flagUrl: 'https://flagcdn.com/w20/ci.png' },
  { code: '+876', country: 'JM', name: 'Jamaica', flagUrl: 'https://flagcdn.com/w20/jm.png' },
  { code: '+962', country: 'JO', name: 'Jordan', flagUrl: 'https://flagcdn.com/w20/jo.png' },
  { code: '+7', country: 'KZ', name: 'Kazakhstan', flagUrl: 'https://flagcdn.com/w20/kz.png' },
  { code: '+254', country: 'KE', name: 'Kenya', flagUrl: 'https://flagcdn.com/w20/ke.png' },
  { code: '+686', country: 'KI', name: 'Kiribati', flagUrl: 'https://flagcdn.com/w20/ki.png' },
  { code: '+965', country: 'KW', name: 'Kuwait', flagUrl: 'https://flagcdn.com/w20/kw.png' },
  { code: '+996', country: 'KG', name: 'Kyrgyzstan', flagUrl: 'https://flagcdn.com/w20/kg.png' },
  { code: '+856', country: 'LA', name: 'Laos', flagUrl: 'https://flagcdn.com/w20/la.png' },
  { code: '+371', country: 'LV', name: 'Latvia', flagUrl: 'https://flagcdn.com/w20/lv.png' },
  { code: '+961', country: 'LB', name: 'Lebanon', flagUrl: 'https://flagcdn.com/w20/lb.png' },
  { code: '+266', country: 'LS', name: 'Lesotho', flagUrl: 'https://flagcdn.com/w20/ls.png' },
  { code: '+231', country: 'LR', name: 'Liberia', flagUrl: 'https://flagcdn.com/w20/lr.png' },
  { code: '+218', country: 'LY', name: 'Libya', flagUrl: 'https://flagcdn.com/w20/ly.png' },
  { code: '+423', country: 'LI', name: 'Liechtenstein', flagUrl: 'https://flagcdn.com/w20/li.png' },
  { code: '+370', country: 'LT', name: 'Lithuania', flagUrl: 'https://flagcdn.com/w20/lt.png' },
  { code: '+352', country: 'LU', name: 'Luxembourg', flagUrl: 'https://flagcdn.com/w20/lu.png' },
  { code: '+261', country: 'MG', name: 'Madagascar', flagUrl: 'https://flagcdn.com/w20/mg.png' },
  { code: '+265', country: 'MW', name: 'Malawi', flagUrl: 'https://flagcdn.com/w20/mw.png' },
  { code: '+60', country: 'MY', name: 'Malaysia', flagUrl: 'https://flagcdn.com/w20/my.png' },
  { code: '+960', country: 'MV', name: 'Maldives', flagUrl: 'https://flagcdn.com/w20/mv.png' },
  { code: '+223', country: 'ML', name: 'Mali', flagUrl: 'https://flagcdn.com/w20/ml.png' },
  { code: '+356', country: 'MT', name: 'Malta', flagUrl: 'https://flagcdn.com/w20/mt.png' },
  { code: '+692', country: 'MH', name: 'Marshall Islands', flagUrl: 'https://flagcdn.com/w20/mh.png' },
  { code: '+222', country: 'MR', name: 'Mauritania', flagUrl: 'https://flagcdn.com/w20/mr.png' },
  { code: '+230', country: 'MU', name: 'Mauritius', flagUrl: 'https://flagcdn.com/w20/mu.png' },
  { code: '+691', country: 'FM', name: 'Micronesia', flagUrl: 'https://flagcdn.com/w20/fm.png' },
  { code: '+373', country: 'MD', name: 'Moldova', flagUrl: 'https://flagcdn.com/w20/md.png' },
  { code: '+377', country: 'MC', name: 'Monaco', flagUrl: 'https://flagcdn.com/w20/mc.png' },
  { code: '+976', country: 'MN', name: 'Mongolia', flagUrl: 'https://flagcdn.com/w20/mn.png' },
  { code: '+382', country: 'ME', name: 'Montenegro', flagUrl: 'https://flagcdn.com/w20/me.png' },
  { code: '+258', country: 'MZ', name: 'Mozambique', flagUrl: 'https://flagcdn.com/w20/mz.png' },
  { code: '+95', country: 'MM', name: 'Myanmar', flagUrl: 'https://flagcdn.com/w20/mm.png' },
  { code: '+264', country: 'NA', name: 'Namibia', flagUrl: 'https://flagcdn.com/w20/na.png' },
  { code: '+674', country: 'NR', name: 'Nauru', flagUrl: 'https://flagcdn.com/w20/nr.png' },
  { code: '+977', country: 'NP', name: 'Nepal', flagUrl: 'https://flagcdn.com/w20/np.png' },
  { code: '+31', country: 'NL', name: 'Netherlands', flagUrl: 'https://flagcdn.com/w20/nl.png' },
  { code: '+64', country: 'NZ', name: 'New Zealand', flagUrl: 'https://flagcdn.com/w20/nz.png' },
  { code: '+505', country: 'NI', name: 'Nicaragua', flagUrl: 'https://flagcdn.com/w20/ni.png' },
  { code: '+227', country: 'NE', name: 'Niger', flagUrl: 'https://flagcdn.com/w20/ne.png' },
  { code: '+234', country: 'NG', name: 'Nigeria', flagUrl: 'https://flagcdn.com/w20/ng.png' },
  { code: '+389', country: 'MK', name: 'North Macedonia', flagUrl: 'https://flagcdn.com/w20/mk.png' },
  { code: '+47', country: 'NO', name: 'Norway', flagUrl: 'https://flagcdn.com/w20/no.png' },
  { code: '+968', country: 'OM', name: 'Oman', flagUrl: 'https://flagcdn.com/w20/om.png' },
  { code: '+92', country: 'PK', name: 'Pakistan', flagUrl: 'https://flagcdn.com/w20/pk.png' },
  { code: '+680', country: 'PW', name: 'Palau', flagUrl: 'https://flagcdn.com/w20/pw.png' },
  { code: '+507', country: 'PA', name: 'Panama', flagUrl: 'https://flagcdn.com/w20/pa.png' },
  { code: '+675', country: 'PG', name: 'Papua New Guinea', flagUrl: 'https://flagcdn.com/w20/pg.png' },
  { code: '+595', country: 'PY', name: 'Paraguay', flagUrl: 'https://flagcdn.com/w20/py.png' },
  { code: '+51', country: 'PE', name: 'Peru', flagUrl: 'https://flagcdn.com/w20/pe.png' },
  { code: '+63', country: 'PH', name: 'Philippines', flagUrl: 'https://flagcdn.com/w20/ph.png' },
  { code: '+48', country: 'PL', name: 'Poland', flagUrl: 'https://flagcdn.com/w20/pl.png' },
  { code: '+351', country: 'PT', name: 'Portugal', flagUrl: 'https://flagcdn.com/w20/pt.png' },
  { code: '+974', country: 'QA', name: 'Qatar', flagUrl: 'https://flagcdn.com/w20/qa.png' },
  { code: '+40', country: 'RO', name: 'Romania', flagUrl: 'https://flagcdn.com/w20/ro.png' },
  { code: '+250', country: 'RW', name: 'Rwanda', flagUrl: 'https://flagcdn.com/w20/rw.png' },
  { code: '+685', country: 'WS', name: 'Samoa', flagUrl: 'https://flagcdn.com/w20/ws.png' },
  { code: '+378', country: 'SM', name: 'San Marino', flagUrl: 'https://flagcdn.com/w20/sm.png' },
  { code: '+239', country: 'ST', name: 'São Tomé and Príncipe', flagUrl: 'https://flagcdn.com/w20/st.png' },
  { code: '+221', country: 'SN', name: 'Senegal', flagUrl: 'https://flagcdn.com/w20/sn.png' },
  { code: '+381', country: 'RS', name: 'Serbia', flagUrl: 'https://flagcdn.com/w20/rs.png' },
  { code: '+248', country: 'SC', name: 'Seychelles', flagUrl: 'https://flagcdn.com/w20/sc.png' },
  { code: '+232', country: 'SL', name: 'Sierra Leone', flagUrl: 'https://flagcdn.com/w20/sl.png' },
  { code: '+65', country: 'SG', name: 'Singapore', flagUrl: 'https://flagcdn.com/w20/sg.png' },
  { code: '+421', country: 'SK', name: 'Slovakia', flagUrl: 'https://flagcdn.com/w20/sk.png' },
  { code: '+386', country: 'SI', name: 'Slovenia', flagUrl: 'https://flagcdn.com/w20/si.png' },
  { code: '+677', country: 'SB', name: 'Solomon Islands', flagUrl: 'https://flagcdn.com/w20/sb.png' },
  { code: '+252', country: 'SO', name: 'Somalia', flagUrl: 'https://flagcdn.com/w20/so.png' },
  { code: '+27', country: 'ZA', name: 'South Africa', flagUrl: 'https://flagcdn.com/w20/za.png' },
  { code: '+211', country: 'SS', name: 'South Sudan', flagUrl: 'https://flagcdn.com/w20/ss.png' },
  { code: '+94', country: 'LK', name: 'Sri Lanka', flagUrl: 'https://flagcdn.com/w20/lk.png' },
  { code: '+249', country: 'SD', name: 'Sudan', flagUrl: 'https://flagcdn.com/w20/sd.png' },
  { code: '+597', country: 'SR', name: 'Suriname', flagUrl: 'https://flagcdn.com/w20/sr.png' },
  { code: '+268', country: 'SZ', name: 'Eswatini', flagUrl: 'https://flagcdn.com/w20/sz.png' },
  { code: '+46', country: 'SE', name: 'Sweden', flagUrl: 'https://flagcdn.com/w20/se.png' },
  { code: '+41', country: 'CH', name: 'Switzerland', flagUrl: 'https://flagcdn.com/w20/ch.png' },
  { code: '+963', country: 'SY', name: 'Syria', flagUrl: 'https://flagcdn.com/w20/sy.png' },
  { code: '+992', country: 'TJ', name: 'Tajikistan', flagUrl: 'https://flagcdn.com/w20/tj.png' },
  { code: '+255', country: 'TZ', name: 'Tanzania', flagUrl: 'https://flagcdn.com/w20/tz.png' },
  { code: '+66', country: 'TH', name: 'Thailand', flagUrl: 'https://flagcdn.com/w20/th.png' },
  { code: '+228', country: 'TG', name: 'Togo', flagUrl: 'https://flagcdn.com/w20/tg.png' },
  { code: '+676', country: 'TO', name: 'Tonga', flagUrl: 'https://flagcdn.com/w20/to.png' },
  { code: '+868', country: 'TT', name: 'Trinidad and Tobago', flagUrl: 'https://flagcdn.com/w20/tt.png' },
  { code: '+90', country: 'TR', name: 'Turkey', flagUrl: 'https://flagcdn.com/w20/tr.png' },
  { code: '+993', country: 'TM', name: 'Turkmenistan', flagUrl: 'https://flagcdn.com/w20/tm.png' },
  { code: '+688', country: 'TV', name: 'Tuvalu', flagUrl: 'https://flagcdn.com/w20/tv.png' },
  { code: '+256', country: 'UG', name: 'Uganda', flagUrl: 'https://flagcdn.com/w20/ug.png' },
  { code: '+380', country: 'UA', name: 'Ukraine', flagUrl: 'https://flagcdn.com/w20/ua.png' },
  { code: '+598', country: 'UY', name: 'Uruguay', flagUrl: 'https://flagcdn.com/w20/uy.png' },
  { code: '+998', country: 'UZ', name: 'Uzbekistan', flagUrl: 'https://flagcdn.com/w20/uz.png' },
  { code: '+678', country: 'VU', name: 'Vanuatu', flagUrl: 'https://flagcdn.com/w20/vu.png' },
  { code: '+58', country: 'VE', name: 'Venezuela', flagUrl: 'https://flagcdn.com/w20/ve.png' },
  { code: '+84', country: 'VN', name: 'Vietnam', flagUrl: 'https://flagcdn.com/w20/vn.png' },
  { code: '+967', country: 'YE', name: 'Yemen', flagUrl: 'https://flagcdn.com/w20/ye.png' },
  { code: '+260', country: 'ZM', name: 'Zambia', flagUrl: 'https://flagcdn.com/w20/zm.png' },
  { code: '+263', country: 'ZW', name: 'Zimbabwe', flagUrl: 'https://flagcdn.com/w20/zw.png' },
  // Note: This list covers most sovereign countries. Additional codes for territories can be added if needed.
];

const formSchema = z.object({
  name: z.string().min(1, "Le nom de la société est requis"), // Translated
  email: z.string().email("Veuillez saisir une adresse e-mail valide"), // Translated
  countryCode: z.string().min(1, "L'indicatif du pays est requis"), // Translated
  phoneNumber: z.string().min(1, "Le numéro de téléphone est requis"), // Translated
  address: z.string().min(1, "L'adresse est requise"), // Translated
  available_forms: z.coerce.number().min(0, 'Doit être un nombre positif'), // Translated
  forms_to_create: z.coerce.number().min(0, 'Doit être un nombre positif'), // Translated
  max_users: z.coerce.number().min(1, 'Doit avoir au moins 1 utilisateur'), // Translated
  admin_name: z.string().min(1, "Le nom de l'administrateur est requis"), // Translated
  admin_email: z.string().email("Veuillez saisir un e-mail administrateur valide"), // Translated
  date_de_debut: z.string().min(1, "La date de début est requise"), // Translated
  date_fin: z.string().min(1, "La date de fin est requise"), // Translated
});

type FormValues = z.infer<typeof formSchema>;

const CreateCompany = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { createCompany } = useApi();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      countryCode: '',
      phoneNumber: '',
      address: '',
      available_forms: 0,
      forms_to_create: 0,
      max_users: 1,
      admin_name: '',
      admin_email: '',
      date_de_debut: '', // Added default
      date_fin: '', // Added default
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Combine country code and phone number
      const phone = `${data.countryCode} ${data.phoneNumber}`;
      
      // Create modified data object with combined phone
      const submitData = {
        name: data.name,
        email: data.email,
        phone,
        address: data.address,
        available_forms: data.available_forms,
        forms_to_create: data.forms_to_create,
        max_users: data.max_users,
        admin_name: data.admin_name,
        admin_email: data.admin_email,
        date_de_debut: data.date_de_debut, // Added date fields
        date_fin: data.date_fin, // Added date fields
      };
      
      await createCompany(submitData);
      
      toast({
        title: "Société créée", // Translated
        description: "La société a été créée avec succès", // Translated
        variant: "default",
      });
      
      navigate('/companies');
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Erreur lors de la création de la société", // Translated
        description: "Un problème est survenu lors de la création de la société", // Translated
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/companies')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sociétés {/* Translated */}
          </Button>
          
          <h1 className="text-2xl font-bold">Ajouter une nouvelle société</h1> {/* Translated */}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations sur la société</CardTitle> {/* Translated */}
                <CardDescription>
                  Saisissez les détails de la nouvelle société {/* Translated */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Détails de la société</h3> {/* Translated */}
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la société</FormLabel> {/* Translated */}
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  placeholder="Nom de la société" // Translated
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse e-mail</FormLabel> {/* Translated */}
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    placeholder="E-mail" // Translated
                                    type="email"
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex space-x-2">
                          <FormField
                            control={form.control}
                            name="countryCode"
                            render={({ field }) => (
                              <FormItem className="w-1/3">
                                <FormLabel>Indicatif</FormLabel> {/* Translated */}
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner l'indicatif" /> {/* Translated */}
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[300px]">
                                    <div className="px-2 py-1">
                                      <Input
                                        placeholder="Rechercher un pays..." // Translated
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                      />
                                    </div>
                                    {countryCodes
                                      .filter(country =>
                                        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        country.code.toLowerCase().includes(searchTerm.toLowerCase())
                                      )
                                      .map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                          <span className="flex items-center">
                                            <img
                                              src={country.flagUrl}
                                              alt={country.name}
                                              className="mr-2 w-5 h-auto"
                                            />
                                            <span>{country.code} ({country.name})</span>
                                          </span>
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem className="w-2/3">
                                <FormLabel>Numéro de téléphone</FormLabel> {/* Translated */}
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      {...field}
                                      placeholder="000-000-0000" // Kept format example
                                      className="pl-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse</FormLabel> {/* Translated */}
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  placeholder="123 Rue Principale, Ville, État, Code Postal" // Translated placeholder example
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Allocation des ressources</h3> {/* Translated */}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="available_forms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Formulaires disponibles</FormLabel> {/* Translated */}
                              <FormControl>
                                <div className="relative">
                                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    className="pl-10"
                                    readOnly // Kept readOnly as it's logic
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="forms_to_create"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Formulaires à créer</FormLabel> {/* Translated */}
                              <FormControl>
                                <div className="relative">
                                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="max_users"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Utilisateurs maximum</FormLabel> {/* Translated */}
                              <FormControl>
                                <div className="relative">
                                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    type="number"
                                    min="1"
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Dates d'abonnement</h3> {/* Translated */}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date_de_debut"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de début</FormLabel> {/* Translated */}
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="date_fin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de fin</FormLabel> {/* Translated */}
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informations Administrateur</h3> {/* Translated */}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="admin_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l'administrateur</FormLabel> {/* Translated */}
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    placeholder="Nom de l'administrateur" // Translated
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="admin_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail de l'administrateur</FormLabel> {/* Translated */}
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    placeholder="E-mail de l'administrateur" // Translated
                                    type="email"
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/companies')}
                      >
                        Annuler {/* Translated */}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Création en cours... {/* Translated */}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Créer la société {/* Translated */}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Aide & Information</CardTitle> {/* Translated */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Détails de la société</h3> {/* Translated */}
                  <p className="text-sm text-muted-foreground">
                    Saisissez les informations de base sur la société, y compris le nom, les coordonnées et l'adresse. {/* Translated */}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Allocation des ressources</h3> {/* Translated */}
                  <p className="text-sm text-muted-foreground">
                    Spécifiez combien de formulaires la société peut créer et combien d'utilisateurs peuvent accéder au système. {/* Translated */}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Informations Administrateur</h3> {/* Translated */}
                  <p className="text-sm text-muted-foreground">
                    Fournissez les détails de l'administrateur principal de la société qui recevra les identifiants de connexion initiaux. {/* Translated */}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCompany;
