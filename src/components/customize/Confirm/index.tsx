"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import parse from "html-react-parser";
import eventEmitter from "@/lib/eventEmitter";

type showConfirmType = {
  title: string;
  body?: string;
  html?: boolean;
  onClose?: Function;
  onDone?: Function;
  onError?: Function;
  action: Function;
};
const EMIT_CONFIRM_KEY = "emit_confirm_key_$#M%&$";

export const ConfirmDialog = () => {
  const [open, setOpen] = useState(false);

  const [action, setAction] = useState<showConfirmType>({
    title: "",
    body: "",
    html: false,
    action: () => {},
    onClose: () => setOpen(false),
    onDone: () => {},
  });

  const doAction = async () => {
    try {
      await action.action();
      setOpen(false);
      if (action.onDone) {
        await action.onDone();
      }
    } catch (error) {
      if (action.onError) {
        action.onError(error);
      }
    }
  };

  const showConfirmDialog = ({ title, onClose, onDone, action, body, html, onError }: showConfirmType) => {
    setOpen(true);
    setAction({
      onClose: onClose ? onClose : () => setOpen(false),
      onDone: onDone ? onDone : () => {},
      action: action ? action : () => {},
      title: title || "",
      body: body || "",
      html: Boolean(html),
      onError: onError ? (err: any) => onError(err) : undefined,
    });
  };
  useEffect(() => {
    eventEmitter.on(EMIT_CONFIRM_KEY, showConfirmDialog);

    return () => {
      eventEmitter.off(EMIT_CONFIRM_KEY, showConfirmDialog);
    };
  }, []);
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div>{action.html ? <>{parse(action.title)}</> : action.title}</div>
          <AlertDialogDescription>{action.html ? <>{parse(action.body || "")}</> : action.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => (action.onClose ? action.onClose() : null)}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={doAction}>Đồng ý</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const showConfirm = (data: showConfirmType) => {
  eventEmitter.emit(EMIT_CONFIRM_KEY, data);
};
