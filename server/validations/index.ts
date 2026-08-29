import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(6, 'Şifreniz en az 6 karakter olmalıdır.'),
  name: z.string().min(2, 'Adınız en az 2 karakter olmalıdır.'),
  role: z.enum(['agent', 'office_manager', 'company_manager', 'admin', 'demo']).optional(),
  kvkkAccepted: z.boolean().refine(val => val === true, {
    message: 'Devam etmek için KVKK Aydınlatma Metnini onaylamanız gerekmektedir.',
  }),
  referralCode: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
  turnstileToken: z.string().optional(),
});
