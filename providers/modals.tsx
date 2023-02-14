import React from "react";

// lib
import { KeyValue } from "lib/types";

// components
import ModalWrapper from "components/ModalWrapper";

// modals
import StateInfo from "modals/StateInfo";
import AddStreetView from "modals/AddStreetview";
import Revision from "modals/Revision";
import Targets from "modals/Targets";

const modals = [
  {
    id: "stateInfo",
    title: "About This Website",
    maxWidth: "1100px",
    Component: StateInfo,
  },
  {
    id: "addStreetView",
    title: "Add Google Street View or Photosphere",
    maxWidth: "700px",
    Component: AddStreetView,
  },
  {
    id: "revision",
    title: "Review Suggestion",
    maxWidth: "700px",
    Component: Revision,
  },
  {
    id: "targets",
    title: "Targets",
    maxWidth: "600px",
    Component: Targets,
  },
];

type Context = {
  open: (id: string, props?: KeyValue) => void;
  close: () => void;
};

export const FieldContext = React.createContext<Context>({
  open: (id, props) => {},
  close: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ModalProvider = ({ children }: Props) => {
  const [modalId, setModalId] = React.useState<string | null>(null);
  const [closing, setClosing] = React.useState(false);
  const [modalProps, setModalProps] = React.useState<KeyValue>({});
  const modal = modals.find((it) => it.id === modalId) || null;
  const Component = modal?.Component as React.ElementType;

  const open = React.useCallback((id: string, props?: KeyValue) => {
    setModalId(id);
    setModalProps(props || {});
  }, []);

  const close = React.useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setModalId(null);
      setClosing(false);
    }, 500);
  }, []);

  const handleDismiss = () => {
    close();
    modalProps?.onDismiss?.();
  };

  return (
    <FieldContext.Provider value={{ open, close }}>
      {children}
      <ModalWrapper
        maxWidth={modal?.maxWidth}
        title={modal?.title || ""}
        open={!!modal && !closing}
        onClose={handleDismiss}
      >
        {modal && <Component {...modalProps} />}
      </ModalWrapper>
    </FieldContext.Provider>
  );
};

const useModal = () => {
  const state = React.useContext(FieldContext);
  return { ...state };
};

const ModalFooter = ({ children }: { children: React.ReactNode }) => {
  return <footer className="p-4 border-t flex items-center bg-gray-50 -mx-4 sm:-mx-6 -mb-4 mt-5">{children}</footer>;
};

export { ModalProvider, useModal, ModalFooter };
