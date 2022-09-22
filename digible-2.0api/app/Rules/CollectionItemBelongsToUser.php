<?php

namespace App\Rules;

use App\Models\CollectionItem;
use App\Models\User;
use Illuminate\Contracts\Validation\Rule;
use Symfony\Component\HttpFoundation\Request;

class CollectionItemBelongsToUser implements Rule
{
    protected ?CollectionItem $collectionItem;

    public function __construct(protected ?User $user, protected Request $request)
    {
    }

    public function passes($attribute, $value)
    {
        if (!$this->user) {
            return false;
        }
        if (empty($value)) {
            return false;
        }
        $this->collectionItem = CollectionItem::with('collection.user')
            ->where('uuid', $value)
            ->first();
        if (empty($this->collectionItem) || $this->user->id !== $this->collectionItem->collection->user->id) {
            return false;
        }
        // Save the collection item to the request so we can use it later and not make another DB call
        $this->request->request->add(['collectionItem' => $this->collectionItem]);
        return true;
    }

    public function message()
    {
        return trans('validation.exists');
    }
}
