import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from '@renderer/app/base.component';
import { ConfigModel } from '@renderer/model/config.model';
import { DatabaseModel } from '@renderer/model/database.model';
import { RequestModel } from '@renderer/model/request.model';
import { ColumnService } from '@renderer/services/management/column.service';
import { DatasourceService } from '@renderer/services/management/datasource.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-component-delete-column',
  templateUrl: './column.delete.component.html'
})
export class DeleteColumnComponent extends BaseComponent {
  @Input()
  config: ConfigModel;
  @Input()
  value: string;
  @Input()
  database: string;
  @Input()
  table: string;
  @Output()
  emitter = new EventEmitter<ConfigModel>();
  inputValue: string;

  constructor(private dataSourceService: DatasourceService,
              private columnService: ColumnService,
              private messageService: NzMessageService) {
    super();
  }

  handlerValidate() {
    if (this.inputValue === this.value) {
      this.disabled.button = false;
    } else {
      this.disabled.button = true;
    }
  }

  handlerDelete() {
    this.loading.button = true;
    const request = new RequestModel();
    request.config = this.dataSourceService.getAll(this.config.value)?.data?.columns[0];
    const _value = new DatabaseModel();
    _value.database = this.database;
    _value.table = this.table;
    _value.name = this.value;
    this.columnService.delete(request, _value).then(response => {
      if (response.status) {
        this.messageService.success(response.message);
        this.config.status = true;
        this.emitter.emit(this.config);
      } else {
        this.messageService.error(response.message);
      }
      this.loading.button = false;
    });
  }
}
