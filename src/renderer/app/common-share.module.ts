import { NgModule } from '@angular/core';
import { DdlQueryComponent } from '@renderer/components/query/ddl/ddl.query.component';
import { NgZorroAntdModule } from '@renderer/app/ng-zorro-antd.module';
import { TranslateModule } from '@ngx-translate/core';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FormsModule } from '@angular/forms';
import { ClipboardComService } from '@renderer/services/other/clipboard.service';
import { BasicTableComponent } from '@renderer/components/table/basic/basic.table.component';
import { CommonModule } from '@angular/common';
import { ServiceModule } from '@renderer/app/service.module';
import { LineChartsComponent } from '@renderer/components/charts/line/line.charts.component';
import { ChartModule } from 'angular-highcharts';
import { EmptyAntdComponent } from '@renderer/components/antd/empty/empty.antd.component';
import { DrividerAntdComponent } from '@renderer/components/antd/drivider/drivider.antd.component';

@NgModule({
  imports: [
    NgZorroAntdModule,
    TranslateModule,
    CodemirrorModule,
    FormsModule,
    CommonModule,
    ServiceModule,
    ChartModule
  ],
  declarations: [
    DdlQueryComponent,
    BasicTableComponent,
    LineChartsComponent,
    EmptyAntdComponent,
    DrividerAntdComponent
  ],
  providers: [
    ClipboardComService
  ],
  exports: [
    DdlQueryComponent,
    BasicTableComponent,
    LineChartsComponent,
    EmptyAntdComponent,
    DrividerAntdComponent
  ]
})
export class CommonShareModule {
}
