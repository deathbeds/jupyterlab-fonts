import { IDisposable, DisposableDelegate } from '@phosphor/disposable';

import { ISignal, Signal } from '@phosphor/signaling';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { IObservableJSON } from '@jupyterlab/observables';

import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';

import { ICON_CLASS, PACKAGE_NAME, CONFIGURED_CLASS } from '.';

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
    console.log('wooo');
    let button = new ToolbarButton({
      iconClassName: ICON_CLASS + ' jp-Icon jp-Icon-16',
      onClick: () => {
        (this.widgetRequested as Signal<any, void>).emit(void 0);
      },
      tooltip: 'Customize Notebook Fonts'
    });

    const metaUpdated = (metadata: IObservableJSON) => {
      const hasMeta = !!metadata.get(PACKAGE_NAME);
      if (hasMeta) {
        button.addClass(CONFIGURED_CLASS);
      } else {
        button.removeClass(CONFIGURED_CLASS);
      }
    };

    panel.model.metadata.changed.connect(metaUpdated);
    metaUpdated(panel.model.metadata);

    panel.toolbar.insertItem(9, 'fonts', button);

    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
