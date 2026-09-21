<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['pending', 'paid', 'paid', 'overdue', 'canceled']);
        $isPaid = $status === 'paid';
        
        return [
            'invoice_number' => 'INV-' . $this->faker->unique()->numberBetween(10000, 99999),
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'status' => $status,
            'due_date' => $this->faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
            'paid_at' => $isPaid ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
        ];
    }
}
