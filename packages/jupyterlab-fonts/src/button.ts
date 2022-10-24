import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { IObservableJSON } from '@jupyterlab/observables';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { ISignal, Signal } from '@lumino/signaling';

import { ICONS } from './icons';
import { PACKAGE_NAME, CONFIGURED_CLASS } from './tokens';

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class NotebookFontsButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  readonly widgetRequested: ISignal<any, void> = new Signal<any, void>(this);
  /**
   * Create a new extension object.
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    let button = new ToolbarButton({
      icon: ICONS.fonts,
      onClick: () => {
        (this.widgetRequested as Signal<any, void>).emit(void 0);
      },
      tooltip: 'Customize Notebook Fonts',
    });

    const metaUpdated = (metadata: IObservableJSON) => {
      const hasMeta = !!metadata.get(PACKAGE_NAME);
      if (hasMeta) {
        button.addClass(CONFIGURED_CLASS);
      } else {
        button.removeClass(CONFIGURED_CLASS);
      }
    };

    if (panel.model) {
      panel.model.metadata.changed.connect(metaUpdated);
      metaUpdated(panel.model.metadata);
    }

    panel.toolbar.insertItem(9, 'fonts', button);

    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
