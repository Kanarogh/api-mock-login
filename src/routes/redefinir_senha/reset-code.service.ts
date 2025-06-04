import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface CodeEntry {
  email: string;
  code: string;
  expiresAt: number;
}

const CODES_FILE = path.resolve(process.cwd(), 'src/mock/codes.json');

@Injectable()
export class ResetCodeService {
  private codes: CodeEntry[] = [];

  constructor() {
    this.loadCodes();
  }

  private loadCodes() {
    if (fs.existsSync(CODES_FILE)) {
      const data = fs.readFileSync(CODES_FILE, 'utf-8');
      this.codes = JSON.parse(data);
    }
  }

  private saveCodes() {
    fs.writeFileSync(CODES_FILE, JSON.stringify(this.codes, null, 2), 'utf-8');
  }

  generateCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    this.codes = this.codes.filter(c => c.email !== email);
    this.codes.push({ email, code, expiresAt });
    this.saveCodes();

    console.log(`🔑 Código para ${email}: ${code}`);
    return code;
  }

  validateCode(email: string, code: string): boolean {
    this.loadCodes(); // garante leitura atualizada
    const entry = this.codes.find(c => c.email === email && c.code === code);
    if (!entry || Date.now() > entry.expiresAt) return false;
    return true;
  }

  invalidateCode(email: string) {
    this.codes = this.codes.filter(c => c.email !== email);
    this.saveCodes();
  }
}
