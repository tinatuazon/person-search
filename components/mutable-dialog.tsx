// component/mutable-dialog.tsx

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "../hooks/use-toast"; // Using shadcn toast hook for notifications.
import { ZodType } from 'zod';

export interface ActionState <T>{
    success: boolean;
    message: string | null;
    data?: T;
  }
interface GenericDialogProps<T extends FieldValues> {
  formSchema: ZodType<T>;
  FormComponent: React.ComponentType<{ form: UseFormReturn<T> }>;
  action?: (data: T) => Promise<ActionState<T>>;
  triggerButtonLabel?: string;
  trigger?: React.ReactNode;
  addDialogTitle?: string;
  editDialogTitle?: string;
  dialogDescription?: string;
  submitButtonLabel?: string;
  defaultValues?: DefaultValues<T>; // If present, this will indicate edit mode
}

export default function MutableDialog<T extends FieldValues>({
  formSchema,
  FormComponent,
  action, 
  defaultValues,
  triggerButtonLabel = defaultValues ? 'Edit' : 'Add',
  trigger,
  addDialogTitle = 'Add',
  editDialogTitle = 'Edit',
  dialogDescription = defaultValues ? 'Make changes to your item here. Click save when you\'re done.' : 'Fill out the form below to add a new item.',
  submitButtonLabel = defaultValues ? 'Save' : 'Add',
}: GenericDialogProps<T>) {
  const [open, setOpen] = useState(false);

  const form = useForm<T>({
    resolver: async (values) => {
      try {
        console.log('Form values before validation:', values); // Log the form values before validation
        const result = formSchema.parse(values);
        console.log('Validation passed:', result); // Log the result after validation
        return { values: result, errors: {} };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
       catch (err: any) {
        if (err.formErrors?.fieldErrors) {
          // check if err is instance of ZodError then return the formErrors
          console.log('Validation errors:',  err.formErrors.fieldErrors); // Log the validation errors
          return { values: {}, errors: err.formErrors.fieldErrors };
        }
        console.error('Unexpected validation error:', err);
        return { values: {}, errors: {} };
      }
    },
    defaultValues: defaultValues,
  });

  // Reset the form when the dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  async function handleSubmit(data: T) {
    if (!action) {
      throw new Error("No action function provided");
    }

    console.log('calling submit');
    const actions = await action(data);  // Call the provided action directly

    console.log('actions:', actions);

    if (actions.success) {
      const toastMessage = actions.message;
      console.log('toastMessage:', toastMessage);
      toast({
        title: "Success",
        description: toastMessage,
        variant: "default",
      });
    } else {
      const toastMessage = actions.message;
      console.log('toastMessage:', toastMessage);
      toast({
        title: "Error",
        description: toastMessage || "Failed to add User",
        variant: "destructive",
      });
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button>{triggerButtonLabel}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? editDialogTitle : addDialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormComponent form={form} />
          <div className="mt-4">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button type="submit">{submitButtonLabel}</Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 