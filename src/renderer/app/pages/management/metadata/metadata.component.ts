import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@renderer/app/base.component';
import { OperationEnum } from '@renderer/enum/operation.enum';
import { TypeEnum } from '@renderer/enum/type.enum';
import { ConfigModel } from '@renderer/model/config.model';
import { MenuModel } from '@renderer/model/menu.model';
import { RequestModel } from '@renderer/model/request.model';
import { ContextMenuService } from '@renderer/services/context.menu.service';
import { DatasourceService } from '@renderer/services/management/datasource.service';
import { MetadataService } from '@renderer/services/management/metadata.service';
import { TreeUtils } from '@renderer/utils/tree.utils';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';

@Component({
  selector: 'app-management-metadata',
  templateUrl: 'metadata.component.html'
})
export class MetadataComponent extends BaseComponent implements OnInit {
  nodes: any[];
  items: any[];
  selectNode: any;
  selectMenu: MenuModel;
  rootNode: any;
  switchType = TypeEnum.disk;
  outerHeight: number;
  contextMenus: MenuModel[];
  disabledComponent = {
    server: false,
    database: {
      create: false,
      delete: false,
      structure: false
    },
    table: false,
    column: false
  };
  database: string;
  table: string;

  constructor(private nzContextMenuService: NzContextMenuService,
              private dataSourceService: DatasourceService,
              private metadataService: MetadataService,
              private messageService: NzMessageService,
              private contextMenuService: ContextMenuService) {
    super();
    const datasourceConfigs = this.dataSourceService.getAll()?.data?.columns.map(k => {
      const configModel = new ConfigModel();
      configModel.key = k.alias;
      configModel.value = k.alias;
      configModel.title = k.alias;
      configModel.type = TypeEnum.disk;
      return configModel;
    });
    this.nodes = datasourceConfigs;
    this.outerHeight = window.outerHeight;
  }

  ngOnInit(): void {
  }

  handlerContextMenu($event: MouseEvent, menu: NzDropdownMenuComponent, origin: any): void {
    if (!origin.level) {
      this.rootNode = origin;
    }
    this.contextMenus = this.contextMenuService.getContextMenu(origin.type);
    this.nzContextMenuService.create($event, menu);
  }

  handlerContextMenuClick(menu: MenuModel): void {
    this.selectMenu = menu;
    this.handlerContextMenuDialog(true);
  }

  handlerContextMenuClose() {
    this.handlerContextMenuDialog(false);
  }

  handlerContextMenuClosed(event: ConfigModel) {
    this.handlerContextMenuDialog(false);
    if (event.status) {
      let node = event.currentNode;
      if (event.menu.command === OperationEnum.delete) {
        node = node.parentNode;
      }
      const originNode: any = node.origin;
      if (event.menu.type === TypeEnum.database) {
        originNode.type = TypeEnum.server;
      }
      const request = new RequestModel();
      request.config = this.dataSourceService.getAll(this.rootNode.value)?.data?.columns[0];
      this.metadataService.getChild(request, originNode).then(response => {
        if (response.status) {
          // clear old data
          node['children'] = [];
          node.addChildren(TreeUtils.builderTreeNode(response.data.columns, originNode.type));
        } else {
          node.addChildren([]);
        }
        this.loading.button = false;
      });
    }
  }

  handlerContextMenuDialog(selected: boolean) {
    switch (this.selectMenu.type) {
      case TypeEnum.server:
        this.disabledComponent.server = selected;
        break;
      case TypeEnum.database:
        switch (this.selectMenu.command) {
          case OperationEnum.delete:
            this.disabledComponent.database.delete = selected;
            break;
          case OperationEnum.create:
            this.disabledComponent.database.create = selected;
            break;
          case OperationEnum.structure:
            this.disabledComponent.database.structure = selected;
            break;
        }
        break;
      case TypeEnum.table:
        this.disabledComponent.table = selected;
        this.database = this.selectNode?.parentNode?.key;
        break;
      case TypeEnum.column:
        this.disabledComponent.column = selected;
        this.database = this.selectNode?.parentNode?.parentNode?.key;
        this.table = this.selectNode?.parentNode?.key;
        break;
    }
  }

  handlerNodeClick(event: NzFormatEmitEvent): void {
    // if (event.node.isSelected) {
    this.loading.button = true;
    if (event.node?.level === 0) {
      this.rootNode = event.node.origin;
    }
    if (event.node !== undefined) {
      this.selectNode = event.node;
    }
    if (this.switchType) {
      this.selectNode.origin.type = TypeEnum.disk;
    } else {
      this.selectNode.origin.type = TypeEnum.server;
    }
    this.handlerLevel(this.selectNode);
    const request = new RequestModel();
    request.config = this.dataSourceService.getAll(this.rootNode.value)?.data?.columns[0];
    this.metadataService.getDiskUsedAndRatio(request, this.selectNode.origin).then(response => {
      if (response.status) {
        this.items = response.data.columns;
      } else {
        this.messageService.error(response.message);
      }
      this.loading.button = false;
    });
    // }
  }

  handlerNodeLoad(event: NzFormatEmitEvent): void {
    const node = event.node;
    this.handlerLevel(node);
    const originNode: any = event.node.origin;
    if (node?.level === 0) {
      originNode.type = TypeEnum.server;
    }
    if (node?.getChildren().length === 0 && node?.isExpanded) {
      const request = new RequestModel();
      request.config = this.dataSourceService.getAll(this.rootNode.value)?.data?.columns[0];
      this.metadataService.getChild(request, originNode).then(response => {
        if (response.status) {
          node.addChildren(TreeUtils.builderTreeNode(response.data.columns, originNode.type));
        } else {
          // this.messageService.error(response.message);
          node.addChildren([]);
        }
        this.loading.button = false;
      });
    }
  }

  handlerKeys(item: any) {
    return Object.keys(item);
  }

  handlerLevel(node) {
    switch (node.level) {
      case 0:
        this.rootNode = node.origin;
        break;
      case 1:
        node.origin.type = TypeEnum.database;
        break;
      case 2:
        node.origin.type = TypeEnum.table;
        break;
      case 3:
        node.origin.type = TypeEnum.column;
        break;
    }
  }
}
