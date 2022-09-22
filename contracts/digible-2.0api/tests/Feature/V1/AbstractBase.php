<?php

namespace Tests\Feature\V1;

use Tests\TestCase;

abstract class AbstractBase extends TestCase
{
    protected const ROUTE_VERSION = 'v1/';

    protected bool $seed = true;
}
