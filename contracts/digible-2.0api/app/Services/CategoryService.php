<?php

namespace App\Services;

use App\Models\Category;

class CategoryService
{
    public function getCategoryFromSlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)->first();
    }
}
