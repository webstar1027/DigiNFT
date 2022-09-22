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
        Schema::create('categories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id', true);
            $table->string('name');
            $table->string('slug')
                ->unique();
            $table->timestamps();
        });

        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete()
                ->restrictOnUpdate();
            $table->uuid()
                ->unique();
            $table->string('name');
            $table->string('image')
                ->nullable();
            $table->text('description')
                ->nullable();
            $table->boolean('private');
            $table->timestamps();
        });

        Schema::create('collection_items', function (Blueprint $table) {
            $table->id();
            $table->uuid()
                ->unique();
            $table->unsignedSmallInteger('category_id');
            $table->foreignId('collection_id')
                ->constrained()
                ->restrictOnDelete()
                ->restrictOnUpdate();
            $table->string('status');
            $table->string('name');
            $table->string('image')
                ->nullable();
            $table->text('description')
                ->nullable();
            $table->timestamps();

            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->restrictOnDelete()
                ->restrictOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('collection_items');
        Schema::dropIfExists('collections');
        Schema::dropIfExists('categories');
    }
};
