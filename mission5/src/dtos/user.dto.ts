import { z } from "zod";

// 회원가입
export const UserRegisterSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  nickname: z.string().min(2, { message: "Nickname too short" }),
  password: z.string().min(6, { message: "Password too short" }),
});
export type UserRegisterDTO = z.infer<typeof UserRegisterSchema>;

// 로그인
export const UserLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
export type UserLoginDTO = z.infer<typeof UserLoginSchema>;

// 정보 수정 
export const UserUpdateSchema = z.object({
  nickname: z.string().min(2).optional(),
  image: z.url().optional(),
});
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;

// 비밀번호 수정
export const UserPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password too short" }),
});
export type UserPasswordDTO = z.infer<typeof UserPasswordSchema>;
