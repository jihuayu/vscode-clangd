import * as vscode from 'vscode';

import { ClangdContext } from './clangd-context';

/**
 *  This method is called when the extension is activated. The extension is
 *  activated the very first time a command is executed.
 */
export async function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('clangd');
  context.subscriptions.push(outputChannel);

  const clangdContext = new ClangdContext;
  context.subscriptions.push(clangdContext);

  // An empty place holder for the activate command, otherwise we'll get an
  // "command is not registered" error.
  context.subscriptions.push(
    vscode.commands.registerCommand('clangd.activate', async () => { }));
  context.subscriptions.push(
    vscode.commands.registerCommand('clangd.restart', async () => {
      await clangdContext.dispose();
      await clangdContext.activate(context.globalStoragePath, outputChannel);
    }));

  await clangdContext.activate(context.globalStoragePath, outputChannel);

  const shouldCheck = vscode.workspace.getConfiguration('clangd').get(
    'detectExtensionConflicts');
  if (shouldCheck) {
    const interval = setInterval(function () {
      const cppTools = vscode.extensions.getExtension('ms-vscode.cpptools');
      if (cppTools && cppTools.isActive) {
        const cppToolsConfiguration =
          vscode.workspace.getConfiguration('C_Cpp');
        const cppToolsEnabled =
          cppToolsConfiguration.get<string>('intelliSenseEngine');
        if (cppToolsEnabled?.toLowerCase() !== 'disabled') {
          const disable = vscode.l10n.t('Disable IntelliSense')
          const neverShow = vscode.l10n.t('Never show this warning')
          const message =
            vscode.l10n.t('You have both the Microsoft C++ (cpptools) extension and clangd extension enabled.' +
              'The Microsoft IntelliSense features conflict with clangd\'s code completion, diagnostics etc.')
          vscode.window
            .showWarningMessage(message, disable, neverShow)
            .then(selection => {
              if (selection == disable) {
                cppToolsConfiguration.update(
                  'intelliSenseEngine', 'disabled',
                  vscode.ConfigurationTarget.Global);
              } else if (selection == neverShow) {
                vscode.workspace.getConfiguration('clangd').update(
                  'detectExtensionConflicts', false,
                  vscode.ConfigurationTarget.Global);
                clearInterval(interval);
              }
            });
        }
      }
    }, 5000);
  }
}
