<?php

namespace Tests\Feature\V1\Auctions;

use Tests\Feature\V1\AbstractBase as Base;

abstract class AbstractBase extends Base
{
    protected const BASE_ROUTE = self::ROUTE_VERSION . 'auctions';
}
