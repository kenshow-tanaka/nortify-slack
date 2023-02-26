/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, injectable } from "tsyringe";
import { DynamoDBStreamEvent } from "aws-lambda";
import { Slack } from "../client/slack";
import { MessageService } from "../services/message-service";
/**
 * dyanmo streams → slack通知 ハンドラ 実装クラス
 */
@injectable()
export class DefaultDynamoStreamsToSlackHandler {
  // eslint-disable-next-line prettier/prettier
  constructor(
    @inject("Slack") private readonly slack: Slack,
    @inject("MessageService") private readonly messageService: MessageService
  ) {}
  async execute(event: DynamoDBStreamEvent): Promise<void> {
    console.log("通知処理を開始します。");
    event.Records.forEach(async (record) => {
      if (record.eventName !== "INSERT") return;
      console.log("Stream record: ", JSON.stringify(record, null, 2));

      const message = this.messageService.createSlackMessage(record);
      let res;
      try {
        res = await this.slack.nortice(message);
        console.log(res);
      } catch (e) {
        console.error("通知処理に失敗しました。", e);
        throw new Error(e);
      }
    });
    console.log("通知処理が完了しました。");
    return;
  }
}
