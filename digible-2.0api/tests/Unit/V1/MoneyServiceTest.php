<?php

namespace Tests\Unit\V1;

use App\DTO\Money;
use App\Models\Currency;
use InvalidArgumentException;
use Tests\TestCase;

class MoneyServiceTest extends TestCase
{
    public function testPricesCanBeConverted()
    {
        $usd = Currency::where('code', 'USD')->first();
        $digi = Currency::where('code', 'DIGI')->first();

        $this->assertTrue(Money::make('1', $usd)->getAstInteger() === 100);
        $this->assertTrue(Money::make('1.00', $usd)->getAstInteger() === 100);
        $this->assertTrue(Money::make('1.2', $usd)->getAstInteger() === 120);
        $this->assertTrue(Money::make('1.09', $usd)->getAstInteger() === 109);
        $this->assertTrue(Money::make('1.09', $usd)->getFormatted() === '1.09');
        $this->assertTrue(Money::make('1.09', $usd)->getFormatted(true) === '1.09');
        $this->assertTrue(Money::make('1', $usd)->getFormatted() === '1.00');
        $this->assertTrue(Money::make('1', $usd)->getFormatted(true) === '1');

        $this->assertTrue(Money::make('1', $digi)->getAstInteger() === 100000000);
        $this->assertTrue(Money::make('10.2', $digi)->getAstInteger() === 1020000000);
        $this->assertTrue(Money::make('1.0000002', $digi)->getAstInteger() === 100000020);
        $this->assertTrue(Money::make('1.09', $digi)->getFormatted() === '1.09000000');
        $this->assertTrue(Money::make('1.09', $digi)->getFormatted(true) === '1.09000000');
        $this->assertTrue(Money::make('1', $digi)->getFormatted() === '1.00000000');
        $this->assertTrue(Money::make('1', $digi)->getFormatted(true) === '1');
    }

    public function testExceptionIsThrownWhenToManyDecimalPlacesAreUsed()
    {
        $this->expectException(InvalidArgumentException::class);
        $usd = Currency::where('code', 'USD')->first();
        Money::make('1.001', $usd)->getAstInteger();
    }

    public function testExceptionIsThrownWhenNonNumericValueIsUsed()
    {
        $this->expectException(InvalidArgumentException::class);
        $usd = Currency::where('code', 'USD')->first();
        Money::make('not a number', $usd)->getAstInteger();
    }

    public function testExceptionIsThrownWhenInvalidNumberIsUsed()
    {
        $this->expectException(InvalidArgumentException::class);
        $usd = Currency::where('code', 'USD')->first();
        Money::make('1.1.1', $usd)->getAstInteger();
    }
}
