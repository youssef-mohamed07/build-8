"use client";

import { useFieldArray, type Control, type FieldErrors, type UseFormRegister, type FieldValues, type Path } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LineItemFormData } from "@/lib/validations/entities";

type FormWithItems = FieldValues & { items: LineItemFormData[] };

export function LineItemsEditor<T extends FormWithItems>({
  control,
  register,
  errors,
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" as never });

  const itemErrors = errors.items as FieldErrors<LineItemFormData>[] | { message?: string } | undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Line Items *</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 } as never)}>
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_80px_100px_40px]">
          <div className="space-y-1">
            <Input placeholder="Description" {...register(`items.${index}.description` as Path<T>)} />
            {Array.isArray(itemErrors) && itemErrors[index]?.description && (
              <p className="text-xs text-destructive">{itemErrors[index]?.description?.message}</p>
            )}
          </div>
          <Input type="number" min={1} placeholder="Qty" {...register(`items.${index}.quantity` as Path<T>, { valueAsNumber: true })} />
          <Input type="number" min={0} step="0.01" placeholder="Price" {...register(`items.${index}.unitPrice` as Path<T>, { valueAsNumber: true })} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      {!Array.isArray(itemErrors) && itemErrors?.message && (
        <p className="text-xs text-destructive">{itemErrors.message}</p>
      )}
    </div>
  );
}
