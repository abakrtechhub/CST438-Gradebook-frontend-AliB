import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import { DataGrid } from '@mui/x-data-grid';
import { SERVER_URL } from '../constants.js'
import { render } from 'react-dom';
import { TextField } from '@mui/material';


// NOTE:  for OAuth security, http request must have
//   credentials: 'include' 

class Assignment extends React.Component {

	constructor(props) {
		super(props);
		this.state = { selected: 0, assignments: [], assignmentName: '', dueDate: '', courseId: '', needsGrading: 1, };

	};


	handleChange = (event) => {

		this.setState({ [event.target.name]: event.target.value })
		console.log("value: " + [event.target.value])
		console.log("courseId: " + [this.state.courseId]);

	}


	componentDidMount() {
		this.fetchAssignments();
	}

	fetchAssignments = () => {
		console.log("Assignment.fetchAssignments");
		const token = Cookies.get('XSRF-TOKEN');
		fetch(`${SERVER_URL}/gradebook`,
			{
				method: 'GET',
				headers: { 'X-XSRF-TOKEN': token }
			})
			.then((response) => response.json())
			.then((responseData) => {
				if (Array.isArray(responseData.assignments)) {
					//  add to each assignment an "id"  This is required by DataGrid  "id" is the row index in the data grid table 
					this.setState({ assignments: responseData.assignments.map((assignment, index) => ({ id: index, ...assignment })) });
				} else {
					toast.error("Fetch failed.", {
						position: toast.POSITION.BOTTOM_LEFT
					});
				}
			})
			.catch(err => console.error(err));
	}

	onRadioClick = (event) => {
		console.log("Assignment.onRadioClick " + event.target.value);
		this.setState({ selected: event.target.value });
	}

	// when submit button pressed, send updated grades to back end 
	//  and then fetch the new grades.
	handleSubmit = (event) => {
		event.preventDefault();
		console.log("Assignment.handleSubmit");
		console.log("this is the courseid: " + this.state.courseId);

		const token = Cookies.get('XSRF-TOKEN');

		fetch(`${SERVER_URL}/course/${this.state.courseId}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-XSRF-TOKEN': token
				},
				body: JSON.stringify({ id: 50, courseId: this.state.courseId, assignmentName: this.state.assignmentName, dueDate: this.state.dueDate, needsGrading: 1 })
			})

			.then(res => {
				if (res.ok) {
					toast.success("Assignment successfully added", {
						position: toast.POSITION.BOTTOM_LEFT
					});

				} else {
					toast.error("Assignment update failed", {
						position: toast.POSITION.BOTTOM_LEFT
					});
					console.error('Put http status =' + res.status);
				}
			})
			.catch(err => {
				toast.error("Assignment update failed", {
					position: toast.POSITION.BOTTOM_LEFT
				});
				console.error(err);
			});
		this.setState({ assignmentName: '', dueDate: '', courseId: '' })

	};




	render() {


		const columns = [
			{
				field: 'assignmentName',
				headerName: 'Assignment',
				width: 400,
				renderCell: (params) => (
					<div>
						<Radio
							checked={params.row.id == this.state.selected}
							onChange={this.onRadioClick}
							value={params.row.id}
							color="default"
							size="small"
						/>

						{params.value}
					</div>

				)
			},
			{ field: 'courseTitle', headerName: 'Course', width: 300 },
			{ field: 'dueDate', headerName: 'Due Date', width: 200 }
		];




		const { assignmentName, dueDate, courseId } = this.state;
		const assignmentSelected = this.state.assignments[this.state.selected];
		return (
			<div align="left" >
				<h4>Assignment(s) ready to grade: </h4>
				<div style={{ height: 450, width: '100%', align: "left" }}>
					<DataGrid rows={this.state.assignments} columns={columns} />
				</div>

				<Button component={Link} to={{ pathname: '/gradebook', assignment: assignmentSelected }}
					variant="outlined" color="primary" disabled={this.state.assignments.length === 0} style={{ margin: 10 }}>
					Grade
				</Button>
				<h4>Insert new assignments: </h4>
				<div style={{ display: 'flex' }}>
					<TextField style={{ width: 800 }} label="courseId" name="courseId" onChange={this.handleChange} value={courseId} />
					<TextField style={{ width: 800 }} label="Name of Assignment" name="assignmentName" onChange={this.handleChange} value={assignmentName} />
					<TextField style={{ width: 800 }} label="Due Date" name="dueDate" onChange={this.handleChange} value={dueDate} />
				</div>

				<Button onClick={this.handleSubmit}
					variant="outlined" color="primary" style={{ margin: 10 }}>
					Submit
				</Button>





				<ToastContainer autoClose={1500} />
			</div>
		)
	}

}



export default Assignment;