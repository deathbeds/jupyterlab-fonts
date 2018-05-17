import {IDisposable, DisposableDelegate} from '@phosphor/disposable';

import {ISignal, Signal} from '@phosphor/signaling';

import {ToolbarButton} from '@jupyterlab/apputils';

import {DocumentRegistry} from '@jupyterlab/docregistry';

import {NotebookPanel, INotebookModel} from '@jupyterlab/notebook';

import {ICON_CLASS} from '.';

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class NotebookFontsButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  readonly widgetRequested: ISignal<any, void> = new Signal<any, void>(this);
  /**
   * Create a new extension object.
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    let button = new ToolbarButton({
      className: ICON_CLASS,
      onClick: () => {
        (this.widgetRequested as Signal<any, void>).emit(void 0);
      },
      tooltip: 'Notebook Fonts',
    });

    panel.toolbar.insertItem(10, 'fonts', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
