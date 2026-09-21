<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
        ]);

        User::factory()->create([
            'name' => 'Standard User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        // Seed some dummy customers (standard users) for pagination testing
        User::factory(30)->create([
            'role' => 'user',
            'status' => fn() => fake()->randomElement(['active', 'inactive', 'active']), // mostly active
        ])->each(function ($user) use ($adminUser) {
            // Give 70% of users a subscription
            if (fake()->boolean(70)) {
                \App\Models\Subscription::factory(1)->create([
                    'user_id' => $user->id
                ]);
            }
            
            // Give 80% of users some invoices
            if (fake()->boolean(80)) {
                \App\Models\Invoice::factory(fake()->numberBetween(1, 5))->create([
                    'user_id' => $user->id
                ]);
            }

            // Give 60% of users some tickets
            if (fake()->boolean(60)) {
                \App\Models\Ticket::factory(fake()->numberBetween(1, 3))->create([
                    'user_id' => $user->id
                ])->each(function ($ticket) use ($adminUser, $user) {
                    // Create some replies for each ticket
                    $numReplies = fake()->numberBetween(0, 5);
                    for ($i = 0; $i < $numReplies; $i++) {
                        \App\Models\TicketReply::factory()->create([
                            'ticket_id' => $ticket->id,
                            'user_id' => fake()->boolean(60) ? $adminUser->id : $user->id, // 60% chance admin replied, 40% user
                        ]);
                    }
                });
            }
        });
    }
}
