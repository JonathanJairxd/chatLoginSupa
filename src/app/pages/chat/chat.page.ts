import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ChatPage implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  private subscription: Subscription | null = null;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.loadMessages();

    // Escuchar mensajes nuevos en tiempo real
    this.supabase.listenMessages((msg) => {
      this.messages.push(msg);
    });
  }

  ngOnDestroy() {
    this.supabase.unsubscribeMessages();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async loadMessages() {
    const { data, error } = await this.supabase['supabase']
      .from('messages')
      .select('*')
      .order('inserted_at', { ascending: true });

    if (!error && data) {
      this.messages = data;
    }
  }

  async sendMessage() {
  const user = this.supabase.currentUser.value;
  if (!user) throw new Error('No user logged in');

  if (!this.newMessage.trim()) return;

  const { data, error } = await this.supabase.supabase
    .from('messages')
    .insert([{ user_id: user.id, username: user.email, content: this.newMessage.trim() }]);
  if (error) throw error;

  this.newMessage = ''; // limpia el input
  return data;
}
}
