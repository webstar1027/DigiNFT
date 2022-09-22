<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $category = Category::first();
        if (!$category) {
            $toCreate = [
                [
                    'name' => 'Pokemon Cards',
                    'slug' => 'pokemon_cards',
                ],
                [
                    'name' => 'Sports cards',
                    'slug' => 'sports_cards',
                ],
                [
                    'name' => 'Coins',
                    'slug' => 'coins',
                ],
                [
                    'name' => 'Stamps',
                    'slug' => 'stamps',
                ],
                [
                    'name' => 'Movie Collectibles',
                    'slug' => 'movie_collectibles',
                ],
                [
                    'name' => 'Cars',
                    'slug' => 'cars',
                ],
                [
                    'name' => 'PokeMan',
                    'slug' => 'pokeman',
                ],
                [
                    'name' => 'Baseball Cards',
                    'slug' => 'baseball_cards',
                ],
            ];
            foreach ($toCreate as $create) {
                Category::create($create);
            }
        }
    }
}
