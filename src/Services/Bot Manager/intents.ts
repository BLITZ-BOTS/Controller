// Packages
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

import { FindBotPath } from '@/Services/File Manager/Paths/Bots';

// Function to toggle an intent in the intents.ts file
export async function toggle_intent(name: string, intent: string) {
  try {
    const intentsFilePath = await join(await FindBotPath(name), 'intents.ts');

    const fileContent = await readTextFile(intentsFilePath);

    const intentsArrayRegex = /intentsArray\s*=\s*\[(.*?)\]/s;
    const match = fileContent.match(intentsArrayRegex);

    if (!match) {
      throw new Error('intentsArray not found in the intents.ts file');
    }

    let intentsArrayContent = match[1].trim();

    const formattedIntent = `IntentsBitField.Flags.${intent}`;

    if (intentsArrayContent.includes(formattedIntent)) {
      intentsArrayContent = intentsArrayContent.replace(
        new RegExp(`\\s*,?\\s*${formattedIntent}\\s*,?\\s*`, 'g'),
        ''
      );
      console.log(`Intent ${formattedIntent} removed from the array.`);
    } else {
      if (intentsArrayContent.length > 0) {
        intentsArrayContent += `, ${formattedIntent}`;
      } else {
        intentsArrayContent = formattedIntent;
      }
      console.log(`Intent ${formattedIntent} added to the array.`);
    }

    const updatedFileContent = fileContent.replace(
      intentsArrayRegex,
      `intentsArray = [${intentsArrayContent}]`
    );

    await writeTextFile(intentsFilePath, updatedFileContent);

    return true;
  } catch (error) {
    console.error('Error toggling intent:', error);
    return false;
  }
}
