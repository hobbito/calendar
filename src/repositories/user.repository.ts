import { User } from "../domain/user.entity";
import type { IUser } from "../domain/user.entity";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  update(id: string, user: Partial<IUser>): Promise<User>;
  delete(id: string): Promise<void>;
}

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor() {
    this.users = [];
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? user : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user ? user : null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async update(id: string, userData: Partial<IUser>): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = {
      ...this.users[index],
      ...userData,
      id,
    };

    this.users[index] = new User(updatedUser);
    return this.users[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}
