import { Component } from '@angular/core';
import { BaseComponent } from '@renderer/app/base.component';
import { QueryHistoryService } from '@renderer/services/query/query.history.service';
import { BaseModel } from '@renderer/model/base.model';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-query-history',
  templateUrl: 'history.component.html'
})
export class HistoryComponent extends BaseComponent {
  tableDetails: BaseModel[];
  queryDDL: string;
  editorConfig: any;

  constructor(private queryHistoryService: QueryHistoryService,
              private modal: NzModalService) {
    super();
    this.initialize();
    this.editorConfig = {
      mode: 'sql',
      readOnly: true
    };
  }

  initialize() {
    this.tableDetails = this.queryHistoryService.getAll();
  }

  handlerShowDDL(item: BaseModel) {
    this.disabled.dialog = true;
    this.queryDDL = item['query'];
  }

  handlerCloseModal() {
    this.disabled.dialog = false;
  }

  handlerShowMessage(item: BaseModel) {
    this.modal.error({
      nzTitle: item.id,
      nzContent: item['message'],
      nzOkText: 'OK'
    });
  }

  handlerAnalysisWidth(): number {
    return this.tableDetails?.length + 360;
  }

  handlerClearHistory() {
    this.queryHistoryService.clear();
    this.initialize();
  }
}
