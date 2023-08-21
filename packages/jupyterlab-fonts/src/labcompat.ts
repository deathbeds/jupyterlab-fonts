import type { ICellModel } from '@jupyterlab/cells';
import type { INotebookModel } from '@jupyterlab/notebook';
import type { ISignal } from '@lumino/signaling';

export function metadataSignal(panelModel: INotebookModel): ISignal<any, any> {
  if (panelModel.sharedModel) {
    return panelModel.sharedModel.metadataChanged;
  }

  if (panelModel) {
    return (panelModel as any).metadata.changed;
  }

  throw new Error('no metadata for panel');
}

export function getPanelMetadata(panelModel: INotebookModel, key: string): any {
  if (panelModel.sharedModel) {
    return panelModel.sharedModel.getMetadata(key);
  }

  if (panelModel) {
    return (panelModel as any).metadata.get(key);
  }

  throw new Error('no metadata for panel');
}

export function setPanelMetadata(
  panelModel: INotebookModel,
  key: string,
  value: any,
): any {
  if (panelModel.sharedModel) {
    panelModel.sharedModel.setMetadata(key, value);
  }

  if (panelModel) {
    (panelModel as any).metadata.set(key, value);
  }

  throw new Error('no metadata for panel');
}

export function getCellMetadata(cellModel: ICellModel, key: string): any {
  if (cellModel.sharedModel) {
    return cellModel.sharedModel.getMetadata(key);
  }

  if (cellModel) {
    return (cellModel as any).metadata.get(key);
  }

  throw new Error('no metadata for cell');
}
export function setCellMetadata(cellModel: ICellModel, key: string, value: any): any {
  if (cellModel.sharedModel) {
    cellModel.sharedModel.setMetadata(key, value);
  }

  if (cellModel) {
    (cellModel as any).metadata.set(key, value);
  }

  throw new Error('no metadata for cell');
}
