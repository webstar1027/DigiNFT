<?php

namespace Tests\Feature\V1\Categories;

use App\Models\Category;

class CategoriesListTest extends AbstractBase
{
    public function testCategoriesAreDisplayed()
    {
        $this->getJson(self::BASE_ROUTE)
            ->assertJsonCount(Category::count(), 'data');
    }
}
