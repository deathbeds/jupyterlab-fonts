import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { ISignal, Signal } from '@lumino/signaling';

import { ICONS } from './icons';
import * as compat from './labcompat';
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
    context: DocumentRegistry.IContext<INotebookModel>,
  ): IDisposable {
    let button = new ToolbarButton({
      icon: ICONS.fonts,
      onClick: () => {
        (this.widgetRequested as Signal<any, void>).emit(void 0);
      },
      tooltip: 'Customize Notebook Fonts',
    });

    const metaUpdated = () => {
      const metadata = panel.model
        ? compat.getPanelMetadata(panel.model, PACKAGE_NAME)
        : null;
      if (metadata) {
        button.addClass(CONFIGURED_CLASS);
      } else {
        button.removeClass(CONFIGURED_CLASS);
      }
    };

    const panelModel = panel.model;

    if (panelModel) {
      compat.metadataSignal(panelModel).connect(metaUpdated);
      metaUpdated();
    }

    panel.toolbar.insertItem(9, 'fonts', button);

    return new DisposableDelegate(() => {
      if (panelModel) {
        compat.metadataSignal(panelModel).disconnect(metaUpdated);
      }
      button.dispose();
    });
  }
}
