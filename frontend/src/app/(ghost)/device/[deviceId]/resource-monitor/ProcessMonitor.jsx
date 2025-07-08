import { Input } from "@/components/ui/input";
import { useProcessesDataSimulation } from "./SystemMonitorDashBoard";
import { Card, CardContent } from "@/components/ui/card";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";


export const ProcessesMonitorSection = () => {
  const { processes, searchTerm, setSearchTerm, endTask } = useProcessesDataSimulation();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-50 mb-4">Running Processes</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search processes by name, PID, or user..."
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-50
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Processes Table */}
      <Card className="bg-gray-800 rounded-xl border border-gray-700">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-gray-700 sticky top-0 z-10">
                <TableRow className="border-gray-700 hover:bg-gray-700">
                  <TableHead className="w-[180px] text-gray-300">Process Name</TableHead>
                  <TableHead className="text-gray-300">PID</TableHead>
                  <TableHead className="text-gray-300">CPU %</TableHead>
                  <TableHead className="text-gray-300">Memory (MB)</TableHead>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.length > 0 ? (
                  processes.map((process) => (
                    <TableRow key={process.id} className="border-gray-800 hover:bg-gray-700/50">
                      <TableCell className="font-medium text-gray-50">{process.name}</TableCell>
                      <TableCell className="text-gray-300">{process.pid}</TableCell>
                      <TableCell className="text-gray-300">{process.cpu}%</TableCell>
                      <TableCell className="text-gray-300">{process.memory} MB</TableCell>
                      <TableCell className="text-gray-300">{process.user}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => endTask(process.pid)}
                          className="text-red-500 hover:text-red-400 hover:bg-gray-700/50"
                        >
                          End Task
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                      No processes found or matching search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};