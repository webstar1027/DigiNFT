<?php

namespace App\Enums;

enum RouteVersionPaths: string
{
    private const BASE_ROUTE_PATH = 'routes';

    case V1 = 'v1';

    public static function getBasePath(RouteVersionPaths $paths, string $suffix = ''): string
    {
        if ($suffix) {
            $suffix = trim($suffix, '/');
        }
        return base_path(self::BASE_ROUTE_PATH . '/' . $paths->value . '/' . $suffix);
    }
}
