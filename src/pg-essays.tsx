import { List, Detail, ActionPanel, Action, Icon, Color } from "@raycast/api";
import { useState, useEffect } from "react";
import axios from 'axios';
import * as cheerio from 'cheerio';

// Fetch essay function
async function fetchEssay(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const essayText = $('table table font').text();
    
    return essayText;
  } catch (error) {
    console.error('Error fetching essay:', error);
    return 'Failed to fetch essay';
  }
}

// List of essays
const essays = [
  { title: "How to Start a Startup", url: "http://www.paulgraham.com/start.html" },
  { title: "Do Things that Don't Scale", url: "http://www.paulgraham.com/ds.html" },
];

// Main command component
export default function Command() {
  return (
    <List>
      {essays.map((essay) => (
        <List.Item
          key={essay.url}
          title={essay.title}
          actions={
            <ActionPanel>
              <Action.Push
                title="Read Essay"
                target={<EssayDetail url={essay.url} title={essay.title} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

// Essay detail component
export function EssayDetail({ url, title }: { url: string; title: string }) {
  const [content, setContent] = useState<string>('Loading...');

  useEffect(() => {
    fetchEssay(url).then(essayText => {
      const formattedContent = formatEssay(essayText, title);
      setContent(formattedContent);
    });
  }, [url, title]);

  return (
    <Detail
      markdown={content}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Author" text="Paul Graham" />
          <Detail.Metadata.TagList title="Topics">
            <Detail.Metadata.TagList.Item text="Startups" color={Color.Orange} />
            <Detail.Metadata.TagList.Item text="Technology" color={Color.Blue} />
            <Detail.Metadata.TagList.Item text="Philosophy" color={Color.Green} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Link title="Original Essay" target={url} text="Read on paulgraham.com" />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            content={content}
            title="Copy Essay"
            icon={Icon.Clipboard}
          />
          <Action.OpenInBrowser url={url} title="Open in Browser" />
        </ActionPanel>
      }
    />
  );
}

function formatEssay(essayText: string, title: string): string {
  const paragraphs = essayText.split('\n\n');
  
  return `
  ${title}

  ${paragraphs.map((p, index) => {
    if (index === 0) {
      return `<p style="font-size: 16px; color: ${Color.PrimaryText}; font-style: italic; border-left: 3px solid ${Color.Blue}; padding-left: 10px; margin-bottom: 20px;">${p}</p>`;
    }
    return `<p style="font-size: 14px; color: ${Color.SecondaryText}; line-height: 1.6; margin-bottom: 15px;">${p}</p>`;
  }).join('\n\n')}
  
  <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid ${Color.SecondaryText}; font-size: 12px; color: ${Color.SecondaryText};">
    Essay by Paul Graham | Read time: ${Math.ceil(essayText.split(' ').length / 200)} minutes
  </div>
    `;
  }