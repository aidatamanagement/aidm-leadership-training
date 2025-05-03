
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PassMarkSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  passMarkPercentage: number;
  setPassMarkPercentage: (value: number) => void;
  enforcePassMark: boolean;
  setEnforcePassMark: (value: boolean) => void;
  onSave: () => void;
}

const PassMarkSettingsDialog = ({
  isOpen,
  onOpenChange,
  passMarkPercentage,
  setPassMarkPercentage,
  enforcePassMark,
  setEnforcePassMark,
  onSave
}: PassMarkSettingsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          Set Pass Mark
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quiz Pass Mark Settings</DialogTitle>
          <DialogDescription>
            Set the minimum pass mark for quizzes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="passMarkPercentage">Pass Mark Percentage</Label>
            <div className="flex items-center">
              <Input 
                id="passMarkPercentage" 
                type="number" 
                min="0" 
                max="100" 
                value={passMarkPercentage} 
                onChange={e => setPassMarkPercentage(Number(e.target.value))} 
                className="w-20" 
              />
              <span className="ml-2">%</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              id="enforcePassMark" 
              type="checkbox" 
              checked={enforcePassMark} 
              onChange={e => setEnforcePassMark(e.target.checked)} 
              className="rounded" 
            />
            <Label htmlFor="enforcePassMark">
              Enforce pass mark (prevents progress if quiz is failed)
            </Label>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassMarkSettingsDialog;
