import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from '@renderer/app/base.component';
import { LogicEnum } from '@renderer/enum/logic.enum';
import { ConfigModel } from '@renderer/model/config.model';
import { DatabaseModel } from '@renderer/model/database.model';
import { RequestModel } from '@renderer/model/request.model';
import { DatasourceService } from '@renderer/services/management/datasource.service';
import { TableService } from '@renderer/services/management/table.service';
import { ValidateUtils } from '@renderer/utils/validate.utils';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-component-clean-table',
    templateUrl: './table.clean.component.html'
})
export class CleanTableComponent extends BaseComponent implements AfterViewInit {
    @Input()
    config: ConfigModel;
    @Input()
    value: string;
    @Input()
    database: string;
    @Output()
    emitter = new EventEmitter<any>();
    allowValue = {
        partition: null,
        logic: null
    };
    partitions: any[];
    allowPartitions: any[];
    logic = LogicEnum;

    constructor(private dataSourceService: DatasourceService,
        private tableService: TableService,
        private messageService: NzMessageService) {
        super();
    }

    ngAfterViewInit(): void {
        this.tableService.getPartitions(this.handlerGetRequest(), this.handlerGetDatabaseModel())
            .then(response => {
                if (response.status) {
                    this.partitions = response.data.columns;
                } else {
                    this.messageService.error(response.message);
                }
            });
    }

    handlerGetRequest(): RequestModel {
        const request = new RequestModel();
        request.config = this.dataSourceService.getAll(this.config.value)?.data?.columns[0];
        return request;
    }

    handlerGetDatabaseModel(): DatabaseModel {
        const _value = new DatabaseModel();
        _value.database = this.database;
        _value.name = this.value;
        return _value;
    }

    handlerValidate() {
        if (ValidateUtils.validate(this.allowValue)) {
            this.tableService.getPartitions(this.handlerGetRequest(), this.handlerGetDatabaseModel(), this.allowValue.partition, this.allowValue.logic)
                .then(response => {
                    if (response.status) {
                        this.allowPartitions = response.data.columns;
                        if (this.allowPartitions?.length > 0) {
                            this.disabled.button = false;
                        } else {
                            this.disabled.button = false;
                        }
                    } else {
                        this.messageService.error(response.message);
                    }
                });
        } else {
            this.disabled.button = true;
        }
    }

    handlerClean(value: string) {
        this.loading.button = true;
        this.tableService.clean(this.handlerGetRequest(), this.handlerGetDatabaseModel(), value)
            .then(response => {
                if (response.status) {
                    this.messageService.success(response.message);
                    this.allowPartitions = this.allowPartitions.filter(v => v.partition !== value);
                } else {
                    this.messageService.error(response.message);
                }
                this.loading.button = false;
            });
    }
}
