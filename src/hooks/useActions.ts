import { useCallback, useState, useMemo, useEffect } from "react";

export type ActionType = {
  pos: number;
  diacritic: number;
};

const useActions = () => {
  const [actions, setActions] = useState<ActionType[]>([]);
  const [actionIdx, setActionIdx] = useState<number>(-1);

  const undoDisabled = useMemo(() => actionIdx === -1, [actionIdx]);

  const redoDisabled = useMemo(
    () => actionIdx === actions.length - 1,
    [actionIdx, actions]
  );

  const getUndoAction = useCallback(() => {
    if (undoDisabled) return;

    const oldActionIdx = actionIdx;
    setActionIdx((prevState) => prevState - 1);

    return actions[oldActionIdx];
  }, [actions, actionIdx, setActionIdx, undoDisabled]);

  const getRedoAction = useCallback(() => {
    if (redoDisabled) return;

    const newActionIdx = actionIdx + 1;
    setActionIdx(newActionIdx);

    return actions[newActionIdx];
  }, [actions, actionIdx, setActionIdx, redoDisabled]);

  const addAction = useCallback(
    (action: ActionType) => {
      setActions((prevState) => [
        ...(actionIdx !== actions.length - 1
          ? prevState.slice(0, actionIdx + 1)
          : prevState),
        action,
      ]);
    },
    [actionIdx, actions, setActions]
  );

  const resetActions = useCallback(() => {
    setActions([]);
    setActionIdx(-1);
  }, [setActionIdx]);

  useEffect(() => {
    setActionIdx(actions.length - 1);
  }, [actions]);

  return {
    actions,
    undoDisabled,
    redoDisabled,
    addAction,
    getUndoAction,
    getRedoAction,
    resetActions,
  };
};

export default useActions;
