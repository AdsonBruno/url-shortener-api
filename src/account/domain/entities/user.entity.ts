export interface UserProps {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly _props: UserProps) {}

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'>): User {
    const now = new Date();
    return new User({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static hydrate(props: UserProps): User {
    return new User(props);
  }

  get props(): UserProps {
    return { ...this._props };
  }

  get id(): string {
    return this._props.id;
  }

  get email(): string {
    return this._props.email;
  }

  get password(): string {
    return this._props.password;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  updatePassword(newPassword: string): void {
    this._props.password = newPassword;
    this._props.updatedAt = new Date();
  }
}
