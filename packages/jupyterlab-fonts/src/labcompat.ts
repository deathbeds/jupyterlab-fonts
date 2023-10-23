import type { ICellModel } from '@jupyterlab/cells';
import type { INotebookModel } from '@jupyterlab/notebook';
import type { ISignal } from '@lumino/signaling';

export function metadataSignal(panelModel: INotebookModel): ISignal<any, any> {
  if (panelModel?.metadata?.changed) {
    return panelModel.metadata.changed as any;
  }

  if (panelModel.sharedModel) {
    return panelModel.sharedModel.metadataChanged;
  }

  throw new Error('no metadata for panel');
}

export function getPanelMetadata(panelModel: INotebookModel, key: string): any {
  if (typeof panelModel.metadata.get === 'function') {
    return (panelModel as any).metadata.get(key);
  }

  if (panelModel.sharedModel) {
    return panelModel.sharedModel.getMetadata(key);
  }

  console.error('panel', panelModel);
  throw new Error('no metadata for panel');
}

export function setPanelMetadata(
  panelModel: INotebookModel,
  key: string,
  value: any,
): any {
  if (typeof panelModel.metadata.set === 'function') {
    return (panelModel as any).metadata.set(key, value);
  }

  if (panelModel.sharedModel) {
    return panelModel.sharedModel.setMetadata(key, value);
  }

  console.error('panel', panelModel);
  throw new Error('no metadata for panel');
}

export function getCellMetadata(cellModel: ICellModel, key: string): any {
  if (typeof cellModel.metadata.get === 'function') {
    return (cellModel as any).metadata.get(key);
  }

  if (cellModel.sharedModel) {
    return cellModel.sharedModel.getMetadata(key);
  }

  console.error('cell', cellModel);
  throw new Error('no metadata for cell');
}

export function setCellMetadata(cellModel: ICellModel, key: string, value: any): void {
  if (typeof cellModel.metadata.set === 'function') {
    return (cellModel as any).metadata.set(key, value);
  }

  if (cellModel.sharedModel) {
    return cellModel.sharedModel.setMetadata(key, value);
  }

  console.error('cell', cellModel);
  throw new Error('no metadata for cell');
}

export function deleteMetadata(cellModel: ICellModel, key: string): void {
  if (typeof cellModel.metadata.delete === 'function') {
    return (cellModel as any).metadata.delete(key);
  }

  if (cellModel.sharedModel) {
    return cellModel.sharedModel.deleteMetadata(key);
  }

  console.error('cell', cellModel);
  throw new Error('no metadata for cell');
}
