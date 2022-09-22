<?php

namespace App\Http\Controllers;

use App\Http\Responders\ResponderInterface;

class ApiController extends Controller
{
    public function __construct(protected ResponderInterface $responder)
    {
    }
}
