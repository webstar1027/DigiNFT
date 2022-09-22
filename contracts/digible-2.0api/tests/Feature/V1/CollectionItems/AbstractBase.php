<?php

namespace Tests\Feature\V1\CollectionItems;

use Tests\Feature\V1\AbstractBase as Base;

class AbstractBase extends Base
{
    protected const BASE_ROUTE = self::ROUTE_VERSION . 'collections/%s/items';
}
