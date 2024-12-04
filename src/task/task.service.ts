import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Team } from 'src/team/entities/team.entity';
import { TaskItem } from './entities/task-item.entity';
import { MemberService } from 'src/member/member.service';
import { ShapeService } from 'src/shape/shape.service';
import { CutItemDto, CutTaskItemDto } from './dto/cut-task-item.dto';
import { Machine } from 'src/machine/entities/machine.entity';
import { Material } from 'src/material/entities/material.entity';
import { CutHistory } from './entities/cut-history.entity';

import { TaskAreaHistoryDto, TaskToAreaDto } from './dto/task-to-area.dto';
import { TaskArea } from './entities/taskarea.entity';
import { Area } from 'src/area/entities/area.entity';
import { TaskAreaHistory } from './entities/taskarea-history';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { JobService } from 'src/job/job.service';
import { User } from 'src/user/entities/user.entity';
import {
  MaterialInspection,
  MemberInspection,
} from 'src/qc/entity/inspection.entity';
import { RFDto } from 'src/qc/dto/rf.dto';
import e from 'express';
import { error } from 'console';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(TaskItem)
    private readonly taskItemRepo: Repository<TaskItem>,

    @InjectRepository(CutHistory)
    private readonly cutHistoryRepo: Repository<CutHistory>,

    @InjectRepository(TaskArea)
    private readonly taskAreaRepo: Repository<TaskArea>,

    @InjectRepository(TaskAreaHistory)
    private readonly taskAreaHistoryRepo: Repository<TaskAreaHistory>,

    @Inject(forwardRef(() => MemberService))
    private memberService: MemberService,

    private readonly shapeService: ShapeService,

    private readonly jobService: JobService,
  ) {}

  calculateDate(delta: number) {
    const currentDate = new Date();

    const localCurrentDate = new Date(
      currentDate.getTime() - currentDate.getTimezoneOffset() * 60 * 1000,
    );

    return new Date(localCurrentDate.getTime() + delta * 24 * 60 * 60 * 1000);
  }

  async create(createTaskDto: TaskDto[]) {
    const assignedMember = {} as Record<string, any>;
    const notAssignedMember = [];

    try {
      const sectionRegex = '[A-Za-z]+';
      const shapes = await this.shapeService.findAll(true);

      for (const {
        member_id,
        team_id,
        assigned,
        piecemark,
        date_delta,
      } of createTaskDto) {
        const member = await this.memberService.findMember(member_id);

        if (!member) {
          notAssignedMember.push({
            member_id,
            piecemark,
            reason: 'Piecemark not found',
          });
          continue;
        }

        for (let i = 0; i < assigned; i++) {
          const task = new Task();
          task.member = { _id: member_id } as Member;
          task.team = { _id: team_id } as Team;

          task.expected_date = this.calculateDate(date_delta);
          task.estimated_date = task.expected_date;

          const savedTask = await task.save();

          if (!assignedMember[piecemark]) {
            assignedMember[piecemark] = {
              piecemark,
              quantity: 0,
            };
          }

          assignedMember[piecemark].quantity += 1;
          const machineTasks: TaskItem[] = [];
          for (const material of member.materials) {
            const materialShape = material.section.match(sectionRegex).at(0);
            const ms = shapes.find((shape) => shape.name == materialShape);

            let machineId = 1;
            if (ms.machines.length) {
              if (materialShape.toLocaleLowerCase() == 'w') {
                const depth = material.section.match('[0-9]+');
                if (depth < 36) {
                  machineId = ms.machines[0]._id;
                }
              } else if (materialShape.toLocaleLowerCase() == 'l') {
                const mtrl = new Material();
                mtrl.section = material.section;
                const [d, b, t] = mtrl.dbt();
                if (d < 6 && b < 6 && t < 0.51) {
                  machineId = ms.machines[0]._id;
                }
              } else if (materialShape.toLocaleLowerCase() == 'pl') {
                const m = new Material();
                m.section = material.section;
                if (m.gsr() < 2.51) {
                  machineId = ms.machines[0]._id;
                }
              }
            }

            const taskMachine = new TaskItem();
            taskMachine.assigned = material.quantity;
            taskMachine.material = material;
            taskMachine.task = savedTask;
            taskMachine.machine = { _id: machineId } as Machine;
            try {
              const savedTaskMachine = await taskMachine.save();
              machineTasks.push(savedTaskMachine);
            } catch (error) {}
          }
        }
      }
    } catch (error) {
      throw error;
    }

    return { assignedMember: Object.values(assignedMember), notAssignedMember };
  }

  async cutTaskItems(cutItemDtos: CutItemDto[], userId: number) {
    const created_at = new Date();

    for (const { _id, quantity } of cutItemDtos) {
      try {
        const cutting = this.cutHistoryRepo.create({
          quantity,
          created_at,
          review_date: null,
        });
        cutting.task_item = { _id } as TaskItem;
        cutting.user = { _id: userId } as User;

        await cutting.save();
      } catch (error) {}
    }

    return 'successfully cut';
  }

  formatTasksArea(tasks: TaskArea[]): any {
    return tasks.map((tsk) => {
      return {
        _id: tsk._id,
        expected_date: tsk.task.expected_date,
        team: tsk.task.team.name,
        task_id: tsk.task._id,
        member: {
          ...tsk.task.member,
          quantity: 1,
          materials: tsk.task.items.map((it) => {
            return {
              ...it.material,
              quantity: it.assigned,
              cut_history: it.cut_history.map((h) => {
                return {
                  ...h,
                  user: h.user.fullname(),
                };
              }),
            };
          }),
          areas: [],
        },
        history: tsk.task.task_area.flatMap((ta) => ta.history),
      };
    });
  }

  formatTaskItems(items: TaskItem[]) {
    return items.map((item) => {
      return {
        _id: item._id,
        assigned: 1, //item.task.member.quantity,
        expected_date: item.task.expected_date,
        team: item.task.team.name,
        task_id: item.task._id,
        //task_quantity: item.task.quantity,
        member: {
          ...item.task.member,
          quantity: 1, //item.task.quantity,
          // weight: 0,
          materials: [
            {
              ...item.material,
              quantity: item.assigned,
              cut_history: item.cut_history.map((h) => {
                return {
                  ...h,
                  user: h.user.fullname(),
                };
              }),
            },
          ],
          areas: [],
        },
        machine: item.machine.name,
      };
    });
  }

  async pendingTaskArea(areaId: number, paqueteId: number, all: boolean) {
    const tasks = await this.taskAreaRepo.find({
      where: {
        area: { _id: areaId },
        task: {
          task_area: { area: { _id: areaId }, on_hold: false },
          member: { paquete: { _id: paqueteId } },
        },
      },
      relations: {
        task: {
          member: true,
          team: true,
          items: { material: true, cut_history: { user: true } },
          task_area: { history: true },
        },
      },
    });

    //return tasks;
    const formatedTasks = this.formatTasksArea(tasks);

    return formatedTasks.filter((ft) => {
      const notCompleted = ft.history.some(
        (h: { completed: number }) => h.completed == 0,
      );

      if (notCompleted || ft.history.length == 0) {
        return ft;
      }
    });
  }

  async pendingTaskMachine(machineId: number, paqueteId: number, all: boolean) {
    const itms = await this.taskItemRepo.find({
      where: {
        machine: { _id: machineId },
        task: { member: { paquete: { _id: paqueteId } } },
      },
      relations: {
        task: { team: true, member: true },
        machine: true,
        material: true,
        cut_history: { user: true },
      },
    });

    const tasks = this.formatTaskItems(itms);
    // return tasks.filter((t) => t.member.piecemark == '13B1');
    //return tasks;
    if (all) return tasks;
    return tasks
      .map((tsk) => {
        const totalCut = tsk.member.materials[0].cut_history.reduce(
          (acc, c) => (acc += c.quantity),
          0,
        );
        console.log(totalCut);
        if (tsk.member.materials[0].quantity > totalCut) {
          return tsk;
        }
      })
      .filter(Boolean);
  }

  async getItems(machineId: number, paqueteId: number) {
    const itms = await this.taskItemRepo.find({
      where: {
        machine: { _id: machineId },
        task: { member: { paquete: { _id: paqueteId } } },
      },
      relations: {
        task: { team: true },
        machine: true,
        material: true,
        cut_history: { user: true },
      },
    });

    return itms;
  }

  async jobMachineTask(machineId: number, job_id: number) {
    const job = await this.jobService.findById(job_id);

    if (!job) throw new NotFoundException('job not found');

    const paqs = await Promise.all(
      job.paquetes.map(async (pqt) => {
        const items = await this.getItems(machineId, pqt._id);

        if (items.length) {
          return {
            name: pqt.name,
            items: items.map((item) => {
              return {
                _id: item._id,
                team: item.task.team.name,
                estimated_date: item.task.expected_date,
                material: {
                  ...item.material,
                  quantity: item.assigned,
                  cut_history: item.cut_history.map((h) => {
                    const { user, ...rest } = h;
                    return {
                      ...rest,
                    };
                  }),
                },
              };
            }),
          };
        }
      }),
    );
    return paqs.filter(Boolean);
  }

  async recentlyCutMaterials(paqueteId: number) {
    const items = await this.taskItemRepo.find({
      where: {
        task: { member: { paquete: { _id: paqueteId } } },
      },
      relations: {
        task: { team: true, member: true },
        machine: true,
        material: true,
        cut_history: { user: true },
      },
    });

    const taskItems = this.formatTaskItems(items);

    return taskItems
      .map((task) => {
        const toBeApproved = task.member.materials[0].cut_history.filter(
          (ch) => ch.approved == null,
        );

        if (toBeApproved.length) {
          task.member.materials[0].cut_history = toBeApproved;
          task.member.materials[0].quantity = toBeApproved.reduce(
            (acc, c) => (acc += c.quantity),
            0,
          );
          return task;
        }
      })
      .filter(Boolean);
  }

  async failedCutMaterials(paqueteId: number) {
    const ch = await this.cutHistoryRepo.find({
      where: {
        task_item: { task: { member: { paquete: { _id: paqueteId } } } },
      },
      relations: {
        task_item: {
          machine: true,
          material: true,
          task: { member: true, team: true },
        },
        inspection: true,
      },
    });
    const failed = ch.filter((c) => {
      return (
        c.approved != null && c.quantity > c.approved && c.inspection == null
      );
    });
    return failed.map((f) => {
      return {
        _id: f._id,
        machine: f.task_item.machine.name,
        member: f.task_item.task.member.piecemark,
        team: f.task_item.task.team.name,
        material: {
          ...f.task_item.material,
          quantity: f.quantity - f.approved,
          cut_history: [],
        },
      };
    });
  }

  async qcCompletedTasks(paqueteId: number) {
    const tasks = await this.taskAreaHistoryRepo.find({
      where: {
        task_area: { task: { member: { paquete: { _id: paqueteId } } } },
      },
      relations: {
        task_area: {
          area: true,
          task: {
            member: true,
            team: true,
            items: { material: true, cut_history: { user: true } },
          },
        },
      },
    });

    const filteredTasks = tasks.filter(
      (th) => th.approved == null && th.completed > 0,
    );

    return filteredTasks.map((th) => {
      return {
        _id: th._id,
        expected_date: th.task_area.task.expected_date,
        area: th.task_area.area.name,
        team: th.task_area.task.team.name,
        task_id: th.task_area.task._id,
        member: {
          ...th.task_area.task.member,
          quantity: 1, //th.completed,
          materials: th.task_area.task.items.map((it) => {
            return {
              ...it.material,
              quantity: it.assigned,
              cut_history: it.cut_history.map((h) => {
                return {
                  ...h,
                  user: h.user.fullname(),
                };
              }),
            };
          }),
          areas: [],
        },
      };
    });
  }

  async qcFailedMembers(paqueteId: number) {
    const tasks = await this.taskAreaHistoryRepo.find({
      where: {
        task_area: { task: { member: { paquete: { _id: paqueteId } } } },
      },
      relations: {
        task_area: {
          area: true,
          task: {
            member: true,
            team: true,
            items: { material: true, cut_history: { user: true } },
          },
        },
        inspection: true,
      },
    });

    const filteredTasks = tasks.filter((th) => {
      return th.approved == false && th.completed > 0 && th.inspection == null;
    });

    return filteredTasks.map((th) => {
      return {
        _id: th._id,
        expected_date: th.task_area.task.expected_date,
        area: th.task_area.area.name,
        team: th.task_area.task.team.name,
        task_id: th.task_area.task._id,
        member: {
          ...th.task_area.task.member,
          quantity: 1, //th.completed,
          materials: th.task_area.task.items.map((it) => {
            return {
              ...it.material,
              quantity: it.assigned,
              cut_history: it.cut_history.map((h) => {
                return {
                  ...h,
                  user: h.user.fullname(),
                };
              }),
            };
          }),
          areas: [],
        },
      };
    });
  }

  async qcReviewCutMaterials(
    cutTaskItemDtos: CutTaskItemDto[],
    areaId: number,
    userId: number,
  ) {
    const review_date = new Date();
    for (const { task_id, cutDtos } of cutTaskItemDtos) {
      if (cutDtos.some((item) => item.quantity > 0)) {
        try {
          const toArea = this.taskAreaRepo.create({
            //assigned: task_assigned,
            area: { _id: areaId } as Area,
            task: { _id: task_id } as Task,
            created_at: review_date,
          });

          await toArea.save();
        } catch (error) {
          // console.log(error);
        }
      }

      for (const { _id, quantity } of cutDtos) {
        await this.cutHistoryRepo.update(
          { _id },
          {
            approved: quantity,
            reviewed_by: { _id: userId } as User,
            review_date,
          },
        );
      }
    }
  }

  async qcReviewMember(
    taskAreaHistoryDto: TaskAreaHistoryDto[],
    areaId: number,
    userId: number,
  ) {
    const dateOfApproval = new Date();
    for (const { _id, quantity, task_id } of taskAreaHistoryDto) {
      try {
        await this.taskAreaHistoryRepo.update(
          { _id },
          {
            approved: quantity > 0 ? true : false,
            date_approval: dateOfApproval,
            reviewed_by: { _id: userId } as User,
          },
        );

        if (quantity > 0) {
          const toArea = this.taskAreaRepo.create({
            //quantity: task_quantity,
            area: { _id: areaId } as Area,
            task: { _id: task_id } as Task,
            created_at: dateOfApproval,
            on_hold: areaId == 4 ? true : false,
          });

          await toArea.save();
        }
      } catch (error) {
        //console.log(error);
      }
    }
  }

  async update(updateTaskDto: UpdateTaskDto[]) {
    for (const { _id, expected_date } of updateTaskDto) {
      await this.taskRepo.update({ _id }, { expected_date });
    }
  }

  async qcInspectCutHistory(_id: number, inspection: MaterialInspection) {
    try {
      return await this.cutHistoryRepo.update({ _id }, { inspection });
    } catch (error) {
      console.log(error);
    }
  }

  async qcInspectTareaHistory(_id: number, inspection: MemberInspection) {
    try {
      return await this.taskAreaHistoryRepo.update({ _id }, { inspection });
    } catch (error) {
      console.log(error);
    }
  }

  async moveToArea(taskToArea: TaskToAreaDto[], userId: number) {
    const created_at = new Date();
    for (const { _id, quantity } of taskToArea) {
      try {
        const toArea = this.taskAreaHistoryRepo.create({
          completed: quantity,
          created_at,
          date_approval: null,
          task_area: { _id: _id } as Task,
          user: { _id: userId } as User,
        });
        await toArea.save();
        // const t = await this.taskAreaHistoryRepo.findOne({
        //   where: { task_area: { _id }, completed: 0 },
        //   relations: { task_area: true },
        // });

        // if (t == null) {
        //   const toArea = this.taskAreaHistoryRepo.create({
        //     completed: quantity,
        //     created_at,
        //     task_area: { _id: _id } as Task,
        //     user: { _id: userId } as User,
        //   });
        //   await toArea.save();
        // } else {
        //   await this.taskAreaHistoryRepo.update(
        //     { _id: t._id },
        //     { completed: 1, date_approval: created_at },
        //   );
        // }
      } catch (error) {
        console.log('move to area error : ', error);
      }
    }
  }

  async remove(deleteTaskDto: DeleteTaskDto[]) {
    for (const a of deleteTaskDto) {
      try {
        await this.taskRepo.delete({ _id: a._id });
      } catch (error) {}
    }

    return 'deleted';
  }

  async getMaterialsReports(paqueteId: number, completed: boolean = false) {
    const items = await this.cutHistoryRepo.find({
      // where: {
      //   task_item: { task: { member: { paquete: { _id: paqueteId } } } },
      // },

      relations: {
        inspection: {
          criteriaAnswers: { criteria: true },
          inspector: true,
          fabricator: true,
        },
        task_item: { material: true },
      },
    });

    return items
      .map((item) => {
        if (item.inspection != null && item.inspection.completed == completed) {
          const { criteriaAnswers, ...rest } = item.inspection;
          return {
            criteria_answers: criteriaAnswers,
            ...rest,
            materials: [
              {
                ...item.task_item.material,
                quantity: item.quantity - item.approved,
                cut_history: [],
              },
            ],
            members: [],
          };
        }
      })
      .filter(Boolean);
  }

  async getMembersReports(paqueteId: number, completed: boolean = false) {
    const tasks = await this.taskAreaHistoryRepo.find({
      relations: {
        inspection: {
          criteriaAnswers: { criteria: true },
          inspector: true,
          fabricator: true,
        },
        task_area: { task: { member: true } },
      },
    });

    return tasks
      .map((task) => {
        if (task.inspection != null && task.inspection.completed == completed) {
          const { criteriaAnswers, ...rest } = task.inspection;
          return {
            criteria_answers: criteriaAnswers,
            ...rest,
            members: [
              {
                ...task.task_area.task.member,
                quantity: 1,
                materials: [],
                areas: [],
              },
            ],
            materials: [],
          };
        }
      })
      .filter(Boolean);
  }

  async taskOnHold(paqueteId: number) {
    const tasks = await this.taskAreaRepo.find({
      where: {
        on_hold: true,
        task: { member: { paquete: { _id: paqueteId } } },
      },
      relations: { task: { member: true } },
    });

    return tasks.map((t) => {
      const { task, ...rest } = t;
      return {
        ...rest,
        member: { ...task.member, quantity: 1 },
      };
    });
  }
}
