<?php

namespace App\Console\Commands;

use App\Services\AuctioneerService;
use Illuminate\Console\Command;

class AuctionStartEndCommand extends Command
{
    protected $signature = 'digi:auctioneer';

    protected $description = 'Looks at current auctions and sets their statuses (started, ended) accordingly based on auction times etc.';

    public function __construct(private AuctioneerService $auctioneerService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->auctioneerService->processAuctionsForStatusChange();
        return 0;
    }
}
