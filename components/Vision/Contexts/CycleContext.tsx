import * as React from "react";
import { createMyContext } from "../../../lib/createMyContext";
import { KeyResult } from "../models/KeyResult";
import { Objective } from "../models/Objective";
import type { ColumnsType } from "antd/lib/table/interface";
import { getColumnConfig } from "../columnConfig";
import { message } from "antd";
import { Cycle } from "../models/Cycle";
import { useContext as useLoginCtx } from "components/Login/Context";
import { useMutations } from "./useMutations";

const initialObjective = new Objective();

function useVision(props: {}) {
  const loginCtx = useLoginCtx()!;

  const curCycleId: string | undefined =
    loginCtx.user?.userConfig?.curSelectedCycleId;

  const { cycleObjects } = Cycle.useCycle();

  const curCycle = cycleObjects?.find((el) => el.id === curCycleId);

  const [key, setKey] = React.useState(0);
  const [exportModalVisible, setExportModalVisible] = React.useState(false);
  const [importModalVisible, setImportModalVisible] = React.useState(false);
  const [keyResultModalVisible, setKeyResultModalVisible] = React.useState(
    false,
  );
  const [cyclesModalVisible, setCyclesModalVisible] = React.useState(false);
  const [recordsModalVisible, setRecordsModalVisible] = React.useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const curKeyResult = React.useRef<KeyResult>();

  const {
    changeCurCycleId,
    createCycle: createCycleMutation,
    createObjective,
  } = useMutations();

  function forceRender() {
    setTimeout(() => setKey((s) => s + 1), 0);
  }

  function createCycle() {
    const cycle = new Cycle();
    const data = cycle.toJSON_data();

    createCycleMutation({
      variables: {
        objects: [
          {
            ...data,
            userId: loginCtx.user?.id,
          },
        ],
      },
    });
  }

  function switchCycle(index: number) {
    const cycleId = cycleObjects?.[index].id;

    if (cycleId) {
      changeCurCycleId({
        variables: { curSelectedCycleId: cycleId, userId: loginCtx.user?.id },
      });
    }
  }

  function deleteCycle(cycleId: string, index: number) {
    // okr.current.cycles.splice(index, 1);

    // if (cycleId === curCycle.current?.id) {
    //   curCycle.current = okr.current.cycles[0];
    // }

    forceRender();
  }

  function mutateCycle(cycle: Cycle | ((cycle: Cycle) => Cycle)) {
    // if (!curCycle.current) return;

    // if (typeof cycle === "function") {
    //   cycle = cycle(curCycle.current);
    // }
    // curCycle.current = cycle;

    forceRender();
  }

  const columns: ColumnsType = getColumnConfig({
    handleDelete,
    onKeyResultEditClick: (kr, type) => {
      curKeyResult.current = kr;

      if (type === "remark") {
        setKeyResultModalVisible(true);
      }

      if (type === "records") {
        setRecordsModalVisible(true);
      }
    },
  }).map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleEdit,
      }),
    };
  });

  function handleDelete(keyResult: KeyResult) {
    mutateCycle((cycle) => {
      const index = cycle.findIndexByKeyResult(keyResult);
      const objective = cycle.objectives[index];
      objective.deleteKeyResult(keyResult);

      if (objective.keyResults.length === 0) {
        cycle.deleteObjective(objective);
      }

      return cycle;
    });
  }

  function handleEdit(keyResult: KeyResult) {
    mutateCycle((cycle) => {
      const index = cycle.findIndexByKeyResult(keyResult);
      cycle.objectives[index].editKeyResult(keyResult);

      return cycle;
    });
  }

  function handleAddObjective() {
    const objective = new Objective();
    const data = objective.toJSON_Data();

    createObjective({
      variables: {
        objects: [
          {
            ...data,
            cycle_id: curCycleId,
          },
        ],
      },
    });
  }

  function handleAddKR(objective?: Objective) {
    mutateCycle((cycle) => {
      const isExistedObjective = objective != null;

      if (!isExistedObjective) {
        objective = cycle.objectives.length
          ? new Objective()
          : initialObjective;
      }
      const keyResult = new KeyResult();
      keyResult.objective = objective!;
      objective!.linkKeyResults(keyResult);

      if (!isExistedObjective) {
        cycle.objectives.push(objective!);
      }

      return cycle;
    });
  }

  function handleImportChange(value: string) {
    try {
      mutateCycle(Cycle.fromJSONString(value));
    } catch {
      message.error("Your JSON string is invalid!");
    }
  }

  return {
    cycleObjects,
    curCycle,
    curCycleId,
    mutateCycle,
    forceRender,
    columns,
    key,
    exportModalVisible,
    setExportModalVisible,
    importModalVisible,
    setImportModalVisible,
    handleImportChange,
    keyResultModalVisible,
    setKeyResultModalVisible,
    cyclesModalVisible,
    setCyclesModalVisible,
    recordsModalVisible,
    setRecordsModalVisible,
    settingsModalVisible,
    setSettingsModalVisible,
    curKeyResult,
    handleAddKR,
    createCycle,
    switchCycle,
    deleteCycle,
    handleAddObjective,
  };
}

export const {
  Provider,
  useContext,
  Context: { Consumer },
} = createMyContext<
  Parameters<typeof useVision>[0],
  ReturnType<typeof useVision>
>(useVision);
