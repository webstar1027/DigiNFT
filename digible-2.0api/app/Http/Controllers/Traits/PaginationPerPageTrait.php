<?php

namespace App\Http\Controllers\Traits;

use App\Helpers\PaginationHelper;
use Illuminate\Http\Request;

trait PaginationPerPageTrait
{
    protected function getPerPage(Request $request, int $default = PaginationHelper::PER_PAGE): int
    {
        $perPage = $request->query('perPage');
        if (!is_string($perPage) || !ctype_digit($perPage)) {
            $perPage = $default;
        }
        return (int)$perPage;
    }
}
