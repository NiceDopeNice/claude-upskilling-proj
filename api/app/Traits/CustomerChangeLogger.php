<?php

namespace App\Traits;

use App\Models\CustomerChange;

trait CustomerChangeLogger
{
    public function logChanges(string $action, int $batchId, int $userId): void
    {
        $excluded = ['updated_at', 'created_at'];

        foreach ($this->getChanges() as $field => $newValue) {
            if (in_array($field, $excluded)) {
                continue;
            }

            CustomerChange::create([
                'change_initiator_user_id' => null,
                'change_date'              => now(),
                'change_batch_id'          => $batchId,
                'change_user_id'           => $userId,
                'change_action'            => $action,
                'change_field'             => $field,
                'change_old_value'         => $this->serializeForLog($this->getOriginal($field)),
                'change_new_value'         => $this->serializeForLog($newValue),
            ]);
        }
    }

    private function serializeForLog(mixed $value): ?string
    {
        if ($value === null) return null;
        if (is_array($value)) return json_encode($value);
        if (is_bool($value)) return $value ? '1' : '0';
        return (string) $value;
    }
}
