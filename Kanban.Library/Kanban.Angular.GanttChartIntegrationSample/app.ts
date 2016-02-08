﻿declare var angular;

/// <reference path='./DlhSoft.Kanban.Angular.Components.ts'/>
/// <reference path='./Scripts/DlhSoft.ProjectData.GanttChart.HTML.Controls.d.ts'/>
import GanttChartView = DlhSoft.Controls.GanttChartView;
import TaskItem = GanttChartView.Item;
import PredecessorItem = GanttChartView.PredecessorItem;

interface KanbanItem extends TaskItem
{
    group?: TaskItem;
    state?: any;
}

angular.module('KanbanGanttChartIntegrationSample', ['DlhSoft.Kanban.Angular.Components', 'DlhSoft.ProjectData.GanttChart.Directives'])
    .controller('MainController', function ($scope) {
        // Prepare Gantt Chart data items and settings.
        var ganttChartItems = <TaskItem[]>[
            { content: 'Story A' },
            { content: 'Task 1', indentation: 1, start: new Date(2016, 2 - 1, 11, 08), finish: new Date(2016, 2 - 1, 12, 12), completedFinish: new Date(2016, 2 - 1, 12, 12) },
            { content: 'Task 2', indentation: 1, start: new Date(2016, 2 - 1, 12, 08), finish: new Date(2016, 2 - 1, 12, 16) },
            { content: 'Story B' },
            { content: 'Task 3', indentation: 1, start: new Date(2016, 2 - 1, 15, 08), finish: new Date(2016, 2 - 1, 15, 16), completedFinish: new Date(2016, 2 - 1, 15, 12) },
            { content: 'Task 4', indentation: 1, start: new Date(2016, 2 - 1, 15, 08), finish: new Date(2016, 2 - 1, 16, 16) },
            { content: 'Task 5', indentation: 1, start: new Date(2016, 2 - 1, 16, 08), finish: new Date(2016, 2 - 1, 17, 16) },
            { content: 'Task 6', indentation: 1, start: new Date(2016, 2 - 1, 16, 08), finish: new Date(2016, 2 - 1, 19, 16) }];
        $scope.ganttChartItems = ganttChartItems;
        var ganttChartSettings = <GanttChartView.Settings>{
            selectionMode: 'None',
            currentTime: new Date(2016, 2 - 1, 12) // Display the current time vertical line of the chart at the project start date.
        }
        $scope.ganttChartSettings = ganttChartSettings;
        $scope.onGanttChartItemChanged = (item, propertyName, isDirect, isFinal) => {
            if (!isDirect || !isFinal) // Skip internal changes, and changes occurred during drag operations.
                return;
            switch (propertyName) {
                case 'completedFinish':
                    updateItemState(item); // Update state when completion percentage changes.
                    refresh();
                    break;
                case 'content':
                    refresh();
                    break;
            }
        };
        // Prepare Kanban data items based on Gantt Chart items.
        var newState = { name: 'New' }, inProgressState = { name: 'In progress', isNewItemButtonHidden: true }, doneState = { name: 'Done', isCollapsedByDefaultForGroups: true, isNewItemButtonHidden: true };
        var states = [newState, inProgressState, doneState];
        $scope.states = states;
        var kanbanItems = <KanbanItem[]>[], stories = <KanbanItem[]>[], story: KanbanItem;
        for (var i = 0; i < ganttChartItems.length; i++) {
            var ganttChartItem = ganttChartItems[i];
            if (!ganttChartItem.indentation) {
                story = <KanbanItem>ganttChartItem;
                story.state = newState;
                stories.push(story);
            }
            else {
                var item = <KanbanItem>ganttChartItem;
                item.group = story; // Set the previously defined story as the parent of this item.
                updateItemState(item);
                kanbanItems.push(item);
            }
        }
        $scope.stories = stories;
        $scope.kanbanItems = kanbanItems;
        // In this sample application we only allow changing state for an item using a drag and drop operation, and not its parent story.
        $scope.canMoveKanbanItem = (item: KanbanItem, state, group: KanbanItem) => { return group == item.group; };
        // When state changes, update completion percent accordingly.
        $scope.onKanbanItemStateChanged = (item: KanbanItem, state) => { updateCompletedFinish(item); };
        // Internal functions.
        function updateItemState(item: KanbanItem) {
            var updatedState = !item.completedFinish || item.completedFinish <= item.start ? newState : (item.completedFinish >= item.finish ? doneState : inProgressState);
            if (updatedState != item.state)
                item.state = updatedState;
        };
        function updateCompletedFinish(item: KanbanItem) {
            var updatedCompletedFinish = item.state == newState ? item.start : (item.state == doneState ? item.finish : new Date((item.start.valueOf() + item.finish.valueOf()) / 2));
            item.completedFinish = updatedCompletedFinish;
        }
        function refresh(): void {
            $scope.$apply();
        }
    });
