<?php

namespace Database\Factories;

use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plans = [
            ['name' => 'Basic', 'price' => 9.99],
            ['name' => 'Pro', 'price' => 29.99],
            ['name' => 'Enterprise', 'price' => 99.99],
        ];
        
        $plan = $this->faker->randomElement($plans);
        $status = $this->faker->randomElement(['active', 'active', 'canceled', 'past_due']);

        return [
            'plan_name' => $plan['name'],
            'price' => $plan['price'],
            'status' => $status,
            'starts_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'ends_at' => $status === 'canceled' ? $this->faker->dateTimeBetween('now', '+1 month') : null,
        ];
    }
}
