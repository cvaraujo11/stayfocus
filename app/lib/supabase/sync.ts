import { supabase as supabaseClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Callback types for real-time events
 */
type InsertCallback<T> = (payload: T) => void
type UpdateCallback<T> = (payload: T) => void
type DeleteCallback = (payload: { id: string }) => void

/**
 * Type for Realtime payload
 */
type RealtimePayload<T> = {
  new?: T
  old?: T
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

/**
 * Real-time sync manager for Supabase
 * Manages WebSocket connections and subscriptions to database changes
 */
class SupabaseSync {
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptionCounts: Map<string, number> = new Map()
  private pendingUnsubscribes: Map<string, NodeJS.Timeout> = new Map()
  private supabase = supabaseClient
  private readonly UNSUBSCRIBE_DELAY = 1000 // 1 segundo de delay antes de remover

  /**
   * Subscribe to real-time changes on a table
   * @param table - Table name to subscribe to
   * @param onInsert - Callback for INSERT events
   * @param onUpdate - Callback for UPDATE events
   * @param onDelete - Callback for DELETE events
   * @returns Cleanup function to unsubscribe
   */
  subscribe<T extends Record<string, any> = any>(
    table: string,
    onInsert?: InsertCallback<T>,
    onUpdate?: UpdateCallback<T>,
    onDelete?: DeleteCallback
  ): () => void {
    // Cancel any pending unsubscribe
    const pending = this.pendingUnsubscribes.get(table)
    if (pending) {
      clearTimeout(pending)
      this.pendingUnsubscribes.delete(table)
      console.log(`✅ Cancelled pending unsubscribe for ${table}`)
    }

    // Increment subscription count
    const currentCount = this.subscriptionCounts.get(table) || 0
    this.subscriptionCounts.set(table, currentCount + 1)

    // Check if already subscribed - if so, return existing cleanup
    if (this.channels.has(table)) {
      console.log(`🔄 Reusing existing subscription to ${table} (count: ${currentCount + 1})`)
      // Return a cleanup function that decrements the count
      return () => {
        const count = this.subscriptionCounts.get(table) || 1
        if (count <= 1) {
          this.unsubscribe(table)
          this.subscriptionCounts.delete(table)
        } else {
          this.subscriptionCounts.set(table, count - 1)
          console.log(`📉 Decremented subscription count for ${table} (count: ${count - 1})`)
        }
      }
    }

    // Create channel for this table
    const channel = this.supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
        } as any,
        (payload: any) => {
          if (onInsert && payload.new) {
            onInsert(payload.new as T)
          }
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
        } as any,
        (payload: any) => {
          if (onUpdate && payload.new) {
            onUpdate(payload.new as T)
          }
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
        } as any,
        (payload: any) => {
          if (onDelete && payload.old) {
            onDelete({ id: payload.old.id })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✓ Subscribed to ${table} changes`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`✗ Error subscribing to ${table}`)
        } else if (status === 'TIMED_OUT') {
          console.error(`✗ Subscription to ${table} timed out`)
        }
      })

    // Store channel reference
    this.channels.set(table, channel)

    // Return cleanup function with reference counting
    return () => {
      const count = this.subscriptionCounts.get(table) || 1
      if (count <= 1) {
        this.unsubscribe(table)
        this.subscriptionCounts.delete(table)
      } else {
        this.subscriptionCounts.set(table, count - 1)
        console.log(`📉 Decremented subscription count for ${table} (count: ${count - 1})`)
      }
    }
  }

  /**
   * Subscribe to changes for a specific user's data
   * Filters events to only include rows where user_id matches
   * @param table - Table name to subscribe to
   * @param userId - User ID to filter by
   * @param onInsert - Callback for INSERT events
   * @param onUpdate - Callback for UPDATE events
   * @param onDelete - Callback for DELETE events
   * @returns Cleanup function to unsubscribe
   */
  subscribeToUserData<T extends Record<string, any> = any>(
    table: string,
    userId: string,
    onInsert?: InsertCallback<T>,
    onUpdate?: UpdateCallback<T>,
    onDelete?: DeleteCallback
  ): () => void {
    const channelKey = `${table}-${userId}`

    // Cancel any pending unsubscribe
    const pending = this.pendingUnsubscribes.get(channelKey)
    if (pending) {
      clearTimeout(pending)
      this.pendingUnsubscribes.delete(channelKey)
      console.log(`✅ Cancelled pending unsubscribe for ${channelKey}`)
    }

    // Increment subscription count
    const currentCount = this.subscriptionCounts.get(channelKey) || 0
    this.subscriptionCounts.set(channelKey, currentCount + 1)

    // Check if already subscribed - if so, return existing cleanup
    if (this.channels.has(channelKey)) {
      console.log(`🔄 Reusing existing subscription to ${channelKey} (count: ${currentCount + 1})`)
      // Return a cleanup function that decrements the count
      return () => {
        const count = this.subscriptionCounts.get(channelKey) || 1
        if (count <= 1) {
          this.unsubscribe(channelKey)
          this.subscriptionCounts.delete(channelKey)
        } else {
          this.subscriptionCounts.set(channelKey, count - 1)
          console.log(`📉 Decremented subscription count for ${channelKey} (count: ${count - 1})`)
        }
      }
    }

    // Create channel with user filter
    const channel = this.supabase
      .channel(`${table}-${userId}-changes`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`,
        } as any,
        (payload: any) => {
          if (onInsert && payload.new) {
            onInsert(payload.new as T)
          }
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`,
        } as any,
        (payload: any) => {
          if (onUpdate && payload.new) {
            onUpdate(payload.new as T)
          }
        }
      )
      .on(
        'postgres_changes' as any,
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`,
        } as any,
        (payload: any) => {
          if (onDelete && payload.old) {
            onDelete({ id: payload.old.id })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✓ Subscribed to ${table} changes for user ${userId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`⚠️ Error subscribing to ${table} for user ${userId} (will retry automatically)`)
        } else if (status === 'TIMED_OUT') {
          console.warn(`⚠️ Subscription to ${table} for user ${userId} timed out (will retry automatically)`)
        }
      })

    // Store channel reference
    this.channels.set(channelKey, channel)

    // Return cleanup function with reference counting
    return () => {
      const count = this.subscriptionCounts.get(channelKey) || 1
      if (count <= 1) {
        this.unsubscribe(channelKey)
        this.subscriptionCounts.delete(channelKey)
      } else {
        this.subscriptionCounts.set(channelKey, count - 1)
        console.log(`📉 Decremented subscription count for ${channelKey} (count: ${count - 1})`)
      }
    }
  }

  /**
   * Unsubscribe from a table's changes (with delay to prevent rapid re-subscriptions)
   * @param table - Table name or channel key to unsubscribe from
   */
  unsubscribe(table: string): void {
    // Cancel any pending unsubscribe
    const pending = this.pendingUnsubscribes.get(table)
    if (pending) {
      clearTimeout(pending)
    }

    // Schedule unsubscribe with delay
    const timeout = setTimeout(() => {
      const channel = this.channels.get(table)
      if (channel) {
        this.supabase.removeChannel(channel)
        this.channels.delete(table)
        this.pendingUnsubscribes.delete(table)
        console.log(`✓ Unsubscribed from ${table}`)
      }
    }, this.UNSUBSCRIBE_DELAY)

    this.pendingUnsubscribes.set(table, timeout)
    console.log(`⏳ Scheduled unsubscribe from ${table} in ${this.UNSUBSCRIBE_DELAY}ms`)
  }

  /**
   * Unsubscribe from all active channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, table) => {
      this.supabase.removeChannel(channel)
      console.log(`✓ Unsubscribed from ${table}`)
    })
    this.channels.clear()
  }

  /**
   * Get the number of active subscriptions
   */
  getActiveSubscriptionsCount(): number {
    return this.channels.size
  }

  /**
   * Get list of active subscription keys
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.channels.keys())
  }

  /**
   * Check if subscribed to a specific table
   */
  isSubscribed(table: string): boolean {
    return this.channels.has(table)
  }
}

/**
 * Singleton instance of SupabaseSync
 * Use this instance throughout the application
 */
export const supabaseSync = new SupabaseSync()

/**
 * Export the class for testing or custom instances
 */
export { SupabaseSync }
