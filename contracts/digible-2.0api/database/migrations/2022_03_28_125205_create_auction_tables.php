<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->unsignedMediumInteger('id', true);
            $table->string('name');
            $table->string('code', 4)
                ->unique();
            $table->unsignedTinyInteger('decimal_places');
            $table->string('symbol');
            $table->boolean('active');
            $table->boolean('crypto');
        });

        Schema::create('auction_statuses', function(Blueprint $table) {
            $table->unsignedTinyInteger('id', true);
            $table->string('name');
        });

        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->uuid()
                ->unique();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete()
                ->restrictOnUpdate();
            $table->foreignId('collection_item_id')
                ->constrained()
                ->restrictOnDelete()
                ->restrictOnUpdate();
            $table->unsignedTinyInteger('auction_status_id');
            $table->dateTime('starts');// When the auction starts
            $table->unsignedSmallInteger('period_minutes');// How long the auction will be active for
            $table->unsignedBigInteger('reserve_price');
            $table->unsignedBigInteger('starting_price');
            $table->unsignedMediumInteger('currency_id');
            $table->boolean('sold')
                ->nullable();
            $table->timestamps();

            $table->foreign('currency_id')
                ->references('id')
                ->on('currencies')
                ->restrictOnDelete()
                ->restrictOnUpdate();
            $table->foreign('auction_status_id')
                ->references('id')
                ->on('auction_statuses')
                ->restrictOnDelete()
                ->restrictOnUpdate();
        });

        Schema::create('bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auction_id')
                ->constrained()
                ->restrictOnDelete()
                ->restrictOnUpdate();
            $table->foreignId('user_id')
                ->constrained()
                ->restrictOnDelete()
                ->restrictOnUpdate();
            $table->unsignedBigInteger('price');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bids');
        Schema::dropIfExists('auctions');
        Schema::dropIfExists('auction_statuses');
        Schema::dropIfExists('currencies');
    }
};
