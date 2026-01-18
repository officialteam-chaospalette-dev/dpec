<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // サンプル商品データを追加（重複チェック付き）
        if (Product::count() === 0) {
            Product::create([
                'name' => 'サンプル商品1',
                'description' => 'これはサンプル商品です',
                'price' => 1000.00,
                'image' => 'sample1.jpg'
            ]);

            Product::create([
                'name' => 'サンプル商品2',
                'description' => 'これもサンプル商品です',
                'price' => 2000.00,
                'image' => 'sample2.jpg'
            ]);

            Product::create([
                'name' => 'サンプル商品3',
                'description' => 'これもサンプル商品です',
                'price' => 3000.00,
                'image' => 'sample3.jpg'
            ]);
        }
    }
}
